```markdown
# DOOH Ad Manager Database Schema

I've been working on this schema for a while. It's for a digital billboard ad system where multiple clients (tenants) can manage their own screens, ads, and campaigns.

## How I Structured It

The whole thing is multi-tenant. Every business table has tenant_id so tenants never see each other's data. Soft delete with deleted_at because I don't trust anyone including myself. Audit fields track who created or changed things.

IDs use NEWID() - simple, no coordination needed between servers.

---

## auth Schema

This handles tenants and users.

### tenant table

```sql
CREATE TABLE auth.tenant (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    slug NVARCHAR(100) NOT NULL,
    country NVARCHAR(50) NOT NULL,
    city NVARCHAR(50) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    contact_email NVARCHAR(255) NOT NULL,
    created_at DATETIME2(0) NOT NULL DEFAULT GETUTCDATE(),
    created_by UNIQUEIDENTIFIER NULL,
    updated_at DATETIME2(0),
    updated_by UNIQUEIDENTIFIER NULL,
    deleted_at DATETIME2(0),
    deleted_by UNIQUEIDENTIFIER NULL
);

CREATE UNIQUE INDEX uq_tenant_name ON auth.tenant(name) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_tenant_slug ON auth.tenant(slug) WHERE deleted_at IS NULL;
```

### user table

Tenant_id can be null for super admins. System account also has null tenant.

```sql
CREATE TABLE auth.[user] (
    id      UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NULL REFERENCES auth.tenant(id),
    email NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(512) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('super_admin','tenant_admin','operator','system')),
    is_active BIT NOT NULL DEFAULT 1,
    created_by UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at DATETIME2(0) NOT NULL DEFAULT GETUTCDATE(),
    updated_by UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    updated_at DATETIME2(0),
    deleted_by UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    deleted_at DATETIME2(0)
);

CREATE UNIQUE INDEX uq_user_email ON auth.[user](tenant_id, email) WHERE deleted_at IS NULL;
```

---

## asset Schema

Physical stuff - screens and ad creatives.

### screen table

Each display device. Operator_id links to the user responsible for this screen.

```sql
CREATE TABLE asset.screen (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    name NVARCHAR(255) NOT NULL,
    location NVARCHAR(500) NOT NULL,
    address NVARCHAR(500),
    city NVARCHAR(100),
    country NVARCHAR(100),
    width INT NOT NULL CHECK (width > 0),
    height INT NOT NULL CHECK (height > 0),
    resolution NVARCHAR(50) NOT NULL,
    orientation NVARCHAR(10) NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape','portrait')),
    ip_address NVARCHAR(45),
    mac_address NVARCHAR(17),
    operator_id UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    status NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
    last_seen_at DATETIME2(0),
    created_by UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at DATETIME2(0) NOT NULL DEFAULT GETUTCDATE(),
    updated_by UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    updated_at DATETIME2(0),
    deleted_by UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    deleted_at DATETIME2(0)
);
```

### ad table

All ad creatives. Status tracks approval workflow. Rejection_reason gets filled when someone rejects it.

```sql
CREATE TABLE asset.ad (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    title NVARCHAR(255) NOT NULL,
    media_url NVARCHAR(1000) NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    width INT NOT NULL CHECK (width > 0),
    height INT NOT NULL CHECK (height > 0),
    media_type NVARCHAR(20) NOT NULL CHECK (media_type IN ('image','video')),
    duration_seconds INT NOT NULL CHECK (duration_seconds > 0),
    orientation NVARCHAR(10) NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape','portrait')),
    status NVARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','under_review','approved','rejected','expired')),
    rejection_reason NVARCHAR(500),
    created_by UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at DATETIME2(0) NOT NULL DEFAULT GETUTCDATE(),
    updated_by UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    updated_at DATETIME2(0),
    deleted_by UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    deleted_at DATETIME2(0)
);
```

---

## camp Schema

Campaigns and their relationships.

### campaign table

Time-bound container for ads. Status flows from draft -> submitted -> approved -> scheduled -> active -> ended.

```sql
CREATE TABLE camp.campaign (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    name NVARCHAR(255) NOT NULL,
    start_time DATETIME2(0) NOT NULL,
    end_time DATETIME2(0) NOT NULL CHECK (end_time > start_time),
    status NVARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected','scheduled','active','ended','cancelled')),
    rejection_reason NVARCHAR(500),
    created_by UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at DATETIME2(0) NOT NULL DEFAULT GETUTCDATE(),
    updated_by UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    updated_at DATETIME2(0),
    deleted_by UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    deleted_at DATETIME2(0)
);
```

### campaign_ad table

Which ads belong to which campaign, and what order they play in.

```sql
CREATE TABLE camp.campaign_ad (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    campaign_id UNIQUEIDENTIFIER NOT NULL REFERENCES camp.campaign(id),
    ad_id UNIQUEIDENTIFIER NOT NULL REFERENCES asset.ad(id),
    play_order INT NOT NULL CHECK (play_order >= 1),
    created_by UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at DATETIME2(0) NOT NULL DEFAULT GETUTCDATE(),
    updated_by UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    updated_at DATETIME2(0),
    deleted_by UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    deleted_at DATETIME2(0),
    UNIQUE (campaign_id, play_order),
    UNIQUE (campaign_id, ad_id)
);
```

### campaign_screen table

Which screens run which campaigns.

```sql
CREATE TABLE camp.campaign_screen (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    campaign_id UNIQUEIDENTIFIER NOT NULL REFERENCES camp.campaign(id),
    screen_id UNIQUEIDENTIFIER NOT NULL REFERENCES asset.screen(id),
    created_by UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at DATETIME2(0) NOT NULL DEFAULT GETUTCDATE(),
    updated_by UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    updated_at DATETIME2(0),
    deleted_by UNIQUEIDENTIFIER REFERENCES auth.[user](id),
    deleted_at DATETIME2(0),
    UNIQUE (campaign_id, screen_id)
);
```

---

## play Schema

This is where the money lives. Every time a screen plays an ad, we record it here.

### proof_of_play table

Append-only. Once written, never updated. This is our billing source.

```sql
CREATE TABLE play.proof_of_play (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    screen_id UNIQUEIDENTIFIER NOT NULL REFERENCES asset.screen(id),
    ad_id UNIQUEIDENTIFIER NOT NULL REFERENCES asset.ad(id),
    campaign_id UNIQUEIDENTIFIER NOT NULL REFERENCES camp.campaign(id),
    played_at DATETIME2(3) NOT NULL DEFAULT GETUTCDATE(),
    duration_seconds INT NOT NULL CHECK (duration_seconds >= 0),
    status NVARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','interrupted')),
    created_by UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at DATETIME2(0) NOT NULL DEFAULT GETUTCDATE()
);
```

---

## audit Schema

Future stuff. Planning to add audit_log and change_history tables later.

```sql
CREATE SCHEMA audit;
```

---

## How Tables Relate

```
Tenant (a company)
   │
   ├── Users (employees of that company)
   ├── Screens (their billboards)
   ├── Ads (their creatives)
   │
   └── Campaigns (scheduled ad playlists)
         │
         ├── campaign_ad (which ads, what order)
         └── campaign_screen (which screens)
   
Every play gets recorded in proof_of_play
```

---

## Notes to Myself

- **CHECK constraints** are enough. No need for lookup tables on simple stuff like media_type.
- **width/height** on both screens and ads - lets me filter out mismatches before playlist generation.
- **orientation** is derived from width/height but denormalized for faster queries.
- **Soft delete** everywhere. When in doubt, mark deleted_at instead of actually deleting.
- **UTC times only** - GETUTCDATE() everywhere. Convert in application layer if needed.
- **System account** (id = all zeros) will be used by screens to write proof_of_play entries.

This should work. Let's build the playlist stored procedure next - that's where this schema will prove itself.
```