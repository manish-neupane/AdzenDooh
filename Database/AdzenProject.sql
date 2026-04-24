-- ============================================================
-- SCHEMA: core, inv, dbo
-- Platform: SQL Server (T-SQL)
-- ============================================================

-- ============================================================
-- 1. Tenant
-- ============================================================
CREATE TABLE core.Tenant (
    Id              INT             NOT NULL PRIMARY KEY IDENTITY(1,1),
    [Name]          NVARCHAR(200)   NOT NULL,
    TenantCode      NVARCHAR(50)    NOT NULL UNIQUE,
    ContactName     NVARCHAR(150)   NULL,
    ContactEmail    NVARCHAR(255)   NOT NULL UNIQUE,
    ContactPhone    NVARCHAR(50)    NULL,
    [Address]       NVARCHAR(500)   NULL,
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       INT             NULL,     -- nullable: first tenant/user bootstrapping
    UpdatedAt       DATETIME2       NULL,
    UpdatedBy       INT             NULL,
    IsDeleted       BIT             NOT NULL DEFAULT 0,
    DeletedAt       DATETIME2       NULL,
    DeletedBy       INT             NULL
);

-- ============================================================
-- 2. User
-- ============================================================
CREATE TABLE core.[User] (
    Id              INT             NOT NULL PRIMARY KEY IDENTITY(1,1),
    TenantId        INT             NOT NULL REFERENCES core.Tenant(Id),
    [Name]          NVARCHAR(200)   NOT NULL,
    Email           NVARCHAR(255)   NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(MAX)   NOT NULL,
    IsAdmin         BIT             NOT NULL DEFAULT 0,
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       INT             NULL     REFERENCES core.[User](Id),
    UpdatedAt       DATETIME2       NULL,
    UpdatedBy       INT             NULL     REFERENCES core.[User](Id),
    IsDeleted       BIT             NOT NULL DEFAULT 0,
    DeletedAt       DATETIME2       NULL,
    DeletedBy       INT             NULL     REFERENCES core.[User](Id)
);

-- ============================================================
-- 3. Screen
-- ============================================================
CREATE TABLE inv.Screen (
    Id              INT             NOT NULL PRIMARY KEY IDENTITY(1,1),
    TenantId        INT             NOT NULL REFERENCES core.Tenant(Id),
    [Name]          NVARCHAR(200)   NOT NULL,
    [Location]      NVARCHAR(300)   NOT NULL,
    [Address]       NVARCHAR(500)   NULL,
    [Status]        NVARCHAR(20)    NOT NULL DEFAULT 'active'
                        CHECK ([Status] IN ('active', 'inactive')),
    Resolution      NVARCHAR(50)    NULL,
    Orientation     NVARCHAR(20)    NOT NULL DEFAULT 'landscape'
                        CHECK (Orientation IN ('landscape', 'portrait')),
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       INT             NOT NULL REFERENCES core.[User](Id),
    UpdatedAt       DATETIME2       NULL,
    UpdatedBy       INT             NULL     REFERENCES core.[User](Id),
    IsDeleted       BIT             NOT NULL DEFAULT 0,
    DeletedAt       DATETIME2       NULL,
    DeletedBy       INT             NULL     REFERENCES core.[User](Id)
);

-- ============================================================
-- 4. Screen Operating Hour
-- ============================================================
CREATE TABLE inv.ScreenOperatingHour (
    Id                    INT         NOT NULL PRIMARY KEY IDENTITY(1,1),
    ScreenId              INT         NOT NULL REFERENCES inv.Screen(Id),
    [DayOfWeek]           TINYINT     NOT NULL CHECK ([DayOfWeek] BETWEEN 0 AND 6),
    StartTime             DATETIME    NOT NULL,
    EndTime               DATETIME    NOT NULL,
    AverageAudienceCount  INT         NULL CHECK (AverageAudienceCount >= 0),
    CreatedAt             DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy             INT         NOT NULL REFERENCES core.[User](Id),
    UpdatedAt             DATETIME2   NULL,
    UpdatedBy             INT         NULL     REFERENCES core.[User](Id),
    IsDeleted             BIT         NOT NULL DEFAULT 0,
    DeletedAt             DATETIME2   NULL,
    DeletedBy             INT         NULL     REFERENCES core.[User](Id),
    CONSTRAINT CHK_Soh_StartBeforeEnd CHECK (StartTime < EndTime)
    -- NO unique constraint here; overlap check done in SP
);

-- ============================================================
-- 5. Creative  (intentionally no update columns)
-- ============================================================
CREATE TABLE dbo.Creative (
    Id              INT             NOT NULL PRIMARY KEY IDENTITY(1,1),
    TenantId        INT             NOT NULL REFERENCES core.Tenant(Id),
    [Name]          NVARCHAR(200)   NOT NULL,
    [Url]           NVARCHAR(1000)  NOT NULL,
    IsVideo         BIT             NOT NULL DEFAULT 0,
    Extension       NVARCHAR(10)    NOT NULL,
    Resolution      NVARCHAR(50)    NULL,
    Orientation     NVARCHAR(20)    NOT NULL DEFAULT 'landscape' CHECK (Orientation IN ('landscape', 'portrait')),
    DurationSecond  INT             NULL     CHECK (DurationSecond > 0),
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       INT             NOT NULL REFERENCES core.[User](Id),
    IsDeleted       BIT             NOT NULL DEFAULT 0,
    DeletedAt       DATETIME2       NULL,
    DeletedBy       INT             NULL     REFERENCES core.[User](Id)
);

-- ============================================================
-- 6. Campaign
-- ============================================================
CREATE TABLE dbo.Campaign (
    Id              INT             NOT NULL PRIMARY KEY IDENTITY(1,1),
    TenantId        INT             NOT NULL REFERENCES core.Tenant(Id),
    [Name]          NVARCHAR(200)   NOT NULL,
    [Status]        NVARCHAR(20)    NOT NULL DEFAULT 'online'
                        CHECK ([Status] IN ('online', 'offline')),
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       INT             NOT NULL REFERENCES core.[User](Id),
    UpdatedAt       DATETIME2       NULL,
    UpdatedBy       INT             NULL     REFERENCES core.[User](Id),
    IsDeleted       BIT             NOT NULL DEFAULT 0,
    DeletedAt       DATETIME2       NULL,
    DeletedBy       INT             NULL     REFERENCES core.[User](Id)
);

-- ============================================================
-- 7. Campaign Date  (flight / date range per campaign)
-- ============================================================
CREATE TABLE dbo.CampaignDate (
    Id              INT             NOT NULL PRIMARY KEY IDENTITY(1,1),
    CampaignId      INT             NOT NULL REFERENCES dbo.Campaign(Id),
    StartDate       DATETIME        NOT NULL,
    EndDate         DATETIME        NOT NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       INT             NOT NULL REFERENCES core.[User](Id),
    UpdatedAt       DATETIME2       NULL,
    UpdatedBy       INT             NULL     REFERENCES core.[User](Id),
    IsDeleted       BIT             NOT NULL DEFAULT 0,
    DeletedAt       DATETIME2       NULL,
    DeletedBy       INT             NULL     REFERENCES core.[User](Id),
    CONSTRAINT CHK_CampaignDate_Valid CHECK (StartDate <= EndDate)
);

-- ============================================================
-- 8. Campaign Screen  (which screens run on which flight)
-- ============================================================
CREATE TABLE dbo.CampaignScreen (
    Id                INT         NOT NULL PRIMARY KEY IDENTITY(1,1),
    CampaignDateId    INT         NOT NULL REFERENCES dbo.CampaignDate(Id),
    ScreenId          INT         NOT NULL REFERENCES inv.Screen(Id),
    CreatedAt         DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy         INT         NOT NULL REFERENCES core.[User](Id),
    IsDeleted         BIT         NOT NULL DEFAULT 0,
    DeletedAt         DATETIME2   NULL,
    DeletedBy         INT         NULL     REFERENCES core.[User](Id),
    CONSTRAINT UQ_CampaignScreen UNIQUE (CampaignDateId, ScreenId)
);

-- ============================================================
-- 9. Campaign Creative  (playlist per flight)
-- ============================================================
CREATE TABLE dbo.CampaignCreative (
    Id                INT         NOT NULL PRIMARY KEY IDENTITY(1,1),
    CampaignDateId    INT         NOT NULL REFERENCES dbo.CampaignDate(Id),
    CreativeId        INT         NOT NULL REFERENCES dbo.Creative(Id),
    PlayOrder         INT         NOT NULL DEFAULT 1 CHECK (PlayOrder > 0),
    CreatedAt         DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy         INT         NOT NULL REFERENCES core.[User](Id),
    UpdatedAt         DATETIME2   NULL,
    UpdatedBy         INT         NULL     REFERENCES core.[User](Id),
    IsDeleted         BIT         NOT NULL DEFAULT 0,
    DeletedAt         DATETIME2   NULL,
    DeletedBy         INT         NULL     REFERENCES core.[User](Id),
    CONSTRAINT UQ_CampaignCreative_Order UNIQUE (CampaignDateId, PlayOrder)
);

-- ============================================================
-- 10. Proof of Play
-- ============================================================
CREATE TABLE dbo.ProofOfPlay (
    Id                INT         NOT NULL PRIMARY KEY IDENTITY(1,1),
    TenantId          INT         NOT NULL REFERENCES core.Tenant(Id),
    CampaignId        INT         NOT NULL REFERENCES dbo.Campaign(Id),
    CampaignDateId    INT         NOT NULL REFERENCES dbo.CampaignDate(Id),
    ScreenId          INT         NOT NULL REFERENCES inv.Screen(Id),
    CreativeId        INT         NOT NULL REFERENCES dbo.Creative(Id),
    PlayedAt          DATETIME2   NOT NULL DEFAULT GETUTCDATE(),
    DurationSecond    INT         NULL     CHECK (DurationSecond > 0)
);