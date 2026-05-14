# AdzenDooh

A full-stack **Digital Out-of-Home (DOOH) advertising platform** for managing screens, media creatives, and ad campaigns. Built as an internship project with an enterprise-grade layered architecture.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18, PrimeNG 17, PrimeFlex 4 |
| Backend | ASP.NET Core 8 Web API |
| ORM / Data Access | Dapper |
| Database | SQL Server (Stored Procedures) |
| Media Processing | FFmpeg (via Xabe.FFmpeg) |
| API Docs | Swagger / Swashbuckle |

---

## Project Structure

```
AdzenDooh/
├── AdzenDooh.Frontend/         # Angular 18 SPA
│   └── src/app/
│       ├── inventory/screen/   # Screen & Operating Hours module
│       ├── cms/creative/       # Creative (media) upload & management
│       ├── campaign/           # Campaign creation, listing & detail
│       └── shared/             # Grid component, layout, API service
│
├── AdzenDooh.Backend/
│   ├── DoohClickBackend/       # ASP.NET Core API (entry point)
│   ├── DoohClick.Service/      # Business logic layer
│   ├── DoohClick.Interface/    # Service interfaces
│   ├── DoohClick.Model/        # Request/response models (Mv prefix)
│   └── DataAccessService/      # Dapper wrapper (RetrievalProcedure / ActionProcedure)
│
└── Database/
    ├── DataBase.sql            # Table definitions
    └── StoreProcedures.sql     # All stored procedures
```

---

## Architecture

The project follows a strict top-to-bottom layered flow:

```
SQL Server (Stored Procedures)
        ↓
DataAccessService  (RetrievalProcedure / ActionProcedure)
        ↓
Service Layer  (ICampaignService, IScreenService, ...)
        ↓
Controllers  (BaseController → [controller]/[action] routing)
        ↓
Angular Services  (HttpClient wrappers)
        ↓
Angular Components
```

All API responses are wrapped in a unified `ApiResult<T>` envelope with `Success` / `Fail` factory methods. Paginated grid queries return a `{ Data: [...], TotalCount: N }` shape.

---

## Database Schema

The database is split across three schemas:

**`core` schema** — tenancy and identity
- `Tenant` — top-level organisation record
- `User` — tenant-scoped users with hashed passwords

**`inv` schema** — screen inventory
- `Screen` — physical display screens (unique `MacAddress`)
- `ScreenOperatingHour` — per-screen availability windows with day-of-week and time-range overlap validation

**`dbo` schema** — campaigns and media
- `Creative` — uploaded image/video assets (URL, resolution, orientation, duration)
- `Campaign` — ad campaign with duration and status
- `CampaignDate` — date ranges assigned to a campaign
- `CampaignScreen` — screens assigned to a campaign
- `CampaignCreative` — creative-to-screen-to-date scheduling (the core scheduling record)

---

## Modules

### Inventory — Screens
- List, create, edit, and delete screens
- Per-screen detail view
- Screen status (`active` / `inactive`) and orientation (`portrait` / `landscape`)
- MAC address uniqueness enforced at the database level

### Inventory — Operating Hours
- Manage time slots per screen per day of week
- SP-level overlap detection (intra-batch self-join + against existing DB records)
- Bulk insert / delete via JSON-based stored procedures

### CMS — Creatives
- Upload images and videos (up to 500 MB per file)
- Video metadata extraction via FFmpeg (duration, resolution)
- SHA-based deduplication, served from `wwwroot/images` and `wwwroot/videos`
- Filterable grid with dropdown (`Ddl`) endpoint for campaign assignment

### Campaigns
- Multi-step creation: details → screen selection → date ranges
- Campaign detail view with assigned creatives per screen per date
- Creative assignment dialog with per-screen scheduling

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Angular CLI](https://angular.dev/tools/cli) 18
- [.NET SDK](https://dotnet.microsoft.com/) 8
- SQL Server (local or Docker)
- [FFmpeg](https://ffmpeg.org/) — place binaries at `C:/ffmpeg/bin`

### Database Setup

1. Run `Database/DataBase.sql` to create all tables.
2. Run `Database/StoreProcedures.sql` to create all stored procedures.

### Backend

```bash
cd AdzenDooh.Backend

# Update the connection string in DoohClickBackend/appsettings.json
# "DefaultConnection": "Server=...;Database=AdzenDooh;..."

dotnet run --project DoohClickBackend
```

API will be available at `https://localhost:{port}`.  
Swagger UI is enabled in both Development and Production environments at `/swagger`.

### Frontend

```bash
cd AdzenDooh.Frontend

npm install
ng serve
```

App runs at `http://localhost:4200`. The Angular dev server is pre-configured to call the backend at the URL set in `src/environments/environment.ts`.

---

## API Endpoints

All routes follow the convention `api/[Controller]/[Action]`.

| Controller | Action | Method | Description |
|---|---|---|---|
| `Screen` | `GetAll` | GET | Paginated screen grid |
| `Screen` | `GetDetail` | GET | Single screen detail |
| `Screen` | `GetDdl` | POST | Screen dropdown list |
| `Screen` | `SaveScreen` | POST | Create or update screen |
| `Screen` | `DeleteScreen` | DELETE | Soft-delete screen |
| `ScreenOperatingHour` | `GetHours` | GET | Operating hours by screen |
| `ScreenOperatingHour` | `AddHours` | POST | Bulk add time slots |
| `ScreenOperatingHour` | `DeleteHour` | DELETE | Remove a time slot |
| `Creative` | `Upload` | POST | Upload image or video |
| `Creative` | `GetAll` | GET | Paginated creatives grid |
| `Creative` | `GetDdl` | GET | Creative dropdown list |
| `Creative` | `Delete` | DELETE | Soft-delete creative |
| `Campaign` | `GetAll` | GET | Paginated campaigns grid |
| `Campaign` | `GetCampaignDetail` | GET | Campaign detail view |
| `Campaign` | `GetCampaignCreatives` | GET | Creatives assigned to campaign |
| `Campaign` | `AddCampaign` | POST | Create new campaign |
| `Campaign` | `AddCampaignCreative` | POST | Assign creative to campaign |

---

## Key Conventions

- **Models** use the `Mv` prefix (e.g. `MvCreateCampaign`, `MvScreenFilter`).
- **Stored procedures** use `OPENJSON` for bulk input and `FOR JSON PATH` for output.
- **Error handling** in SPs outputs a typed JSON error (`Type` + `Message`); the service layer maps these to .NET exceptions (`KeyNotFoundException` → 404, `InvalidOperationException` → 409).
- **Soft deletes** — no hard deletes; all tables carry `IsDeleted`, `DeletedAt`, `DeletedBy`.
- **Timestamps** use `GETUTCDATE()` throughout.

---

## Authors

- **Manish Neupane** — Backend / Database

