
----------------- SCHEMA: auth-----------------

CREATE SCHEMA core;
GO

CREATE TABLE core.tenant (
    id            UNIQUEIDENTIFIER PRIMARY KEY,
    [name]          NVARCHAR(255) NOT NULL,
    tenancy_code   UNIQUEIDENTIFIER,
    country       NVARCHAR(50)  NOT NULL,
    city          NVARCHAR(50)  NOT NULL,
    contact_email NVARCHAR(255) NOT NULL,

    -- Audit
    is_active     BIT NOT NULL,
    is_deleted    BIT NOT NULL,
    created_at    DATETIME2(0) NOT NULL,
    created_by    UNIQUEIDENTIFIER NULL,
    updated_at    DATETIME2(0) NULL,
    updated_by    UNIQUEIDENTIFIER NULL,
    deleted_at    DATETIME2(0) NULL,
    deleted_by    UNIQUEIDENTIFIER NULL
);


GO

---------------- SCHEMA: asset ----------------------

CREATE SCHEMA inv;
GO

CREATE TABLE inv.screen (
    id                   UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id            UNIQUEIDENTIFIER NOT NULL,

    -- Identification
    [name]                 NVARCHAR(255) NOT NULL,
    [location]             NVARCHAR(500) NOT NULL,
    [address]              NVARCHAR(500) NULL,
    city                 NVARCHAR(100) NULL,
    country              NVARCHAR(100) NULL,
    orientation          NVARCHAR(10) NOT NULL CHECK (orientation IN ('portrait', 'landscape', 'square')),
    -- Physical dimensions
     area           DECIMAL(10,2) NULL,
    mac_address          NVARCHAR(17) UNIQUE NULL,
    [status]             NVARCHAR(20) NOT NULL,
    last_online          DATETIME2(0) NULL,
    is_deleted           BIT NOT NULL,

    -- audit
    created_by           UNIQUEIDENTIFIER NOT NULL,
    created_at           DATETIME2(0) NOT NULL,
    updated_by           UNIQUEIDENTIFIER NULL,
    updated_at           DATETIME2(0) NULL,
    deleted_by           UNIQUEIDENTIFIER NULL,
    deleted_at           DATETIME2(0) NULL
);


CREATE TABLE inv.screen_operating_hours (
    id                UNIQUEIDENTIFIER PRIMARY KEY,
    screen_id         UNIQUEIDENTIFIER NOT NULL,

 
    start_time        TIME NULL,
    end_time          TIME NULL,
    days_of_week       NVARCHAR(50) NULL,
    avg_audience_count INT NULL,

    is_deleted        BIT NOT NULL,

    -- Audit
    created_by        UNIQUEIDENTIFIER NOT NULL,
    created_at        DATETIME2(0) NOT NULL,
    updated_by        UNIQUEIDENTIFIER NULL,
    updated_at        DATETIME2(0) NULL,
    deleted_by        UNIQUEIDENTIFIER NULL,
    deleted_at        DATETIME2(0) NULL
);

CREATE TABLE inv.media_library(

    id                   UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id            UNIQUEIDENTIFIER NOT NULL,
    [name]                NVARCHAR(255) NOT NULL,
    [url]            NVARCHAR(1000) NOT NULL,
    -- file_size_bytes      BIGINT NOT NULL,
    is_image           BIT  DEFAULT 1,    
    resolution  NVARCHAR(50) NULL,         /*1080p, 720p, 4K etc. */
    orientation  NVARCHAR(10) NOT NULL,
    duration  INT NULL,
    is_deleted           BIT NOT NULL,
    extention NVARCHAR(10) NULL,
    -- Audit
    created_by           UNIQUEIDENTIFIER NOT NULL,
    created_at           DATETIME2(0) NOT NULL,
    deleted_by           UNIQUEIDENTIFIER NULL,
    deleted_at           DATETIME2(0) NULL
);
GO

-------------------- SCHEMA: serve----------------------
GO

CREATE TABLE dbo.campaign (
    id                 UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id          UNIQUEIDENTIFIER NOT NULL,
    [name]             NVARCHAR(255) NOT NULL,
    [status]           NVARCHAR(20) NOT NULL,
    is_deleted         BIT NOT NULL,

    
    -- Audit
    created_by       UNIQUEIDENTIFIER NOT NULL,
    created_at       DATETIME2(0) NOT NULL,
    deleted_by       UNIQUEIDENTIFIER NULL,
    deleted_at       DATETIME2(0) NULL
);


CREATE TABLE campaign_date(
   
     id                UNIQUEIDENTIFIER PRIMARY KEY,
    campaign_id       UNIQUEIDENTIFIER NOT NULL,
    [start_date]        DATE NOT NULL,
    end_date          DATE NOT NULL,
    
)


  
CREATE TABLE serve.campaign_ad (
    id          UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id   UNIQUEIDENTIFIER NOT NULL,
    campaign_id UNIQUEIDENTIFIER NOT NULL,
    ad_id       UNIQUEIDENTIFIER NOT NULL,

    -- Playback sequencing
    play_order  INT NOT NULL,
    is_deleted  BIT NOT NULL,

    -- Audit
    created_by  UNIQUEIDENTIFIER NOT NULL,
    created_at  DATETIME2(0) NOT NULL,
    updated_by  UNIQUEIDENTIFIER NULL,
    updated_at  DATETIME2(0) NULL,
    deleted_by  UNIQUEIDENTIFIER NULL,
    deleted_at  DATETIME2(0) NULL
);

CREATE TABLE serve.campaign_screen (
    id          UNIQUEIDENTIFIER PRIMARY KEY,
    campaign_id UNIQUEIDENTIFIER NOT NULL,
    screen_id   UNIQUEIDENTIFIER NOT NULL,

    --  state
    is_deleted  BIT NOT NULL,

    -- Audit
    created_by  UNIQUEIDENTIFIER NOT NULL,
    created_at  DATETIME2(0) NOT NULL,
    updated_by  UNIQUEIDENTIFIER NULL,
    updated_at  DATETIME2(0) NULL,
    deleted_by  UNIQUEIDENTIFIER NULL,
    deleted_at  DATETIME2(0) NULL
);


GO

-------------------- SCHEMA: stat----------------------

CREATE SCHEMA stat;
GO

CREATE TABLE stat.proof_of_play (
    id               UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id        UNIQUEIDENTIFIER NOT NULL,

    -- Playback event reference
    screen_id        UNIQUEIDENTIFIER NOT NULL,
    ad_id            UNIQUEIDENTIFIER NOT NULL,
    campaign_id      UNIQUEIDENTIFIER NOT NULL,

    -- Metrics
    played_at        DATETIME2(3) NOT NULL,
    duration_seconds INT NOT NULL,
    [status]           NVARCHAR(20) NOT NULL,

    --  audit 
    created_by       UNIQUEIDENTIFIER NULL,
    created_at       DATETIME2(0) NOT NULL
);