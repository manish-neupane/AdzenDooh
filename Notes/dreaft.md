CREATE TABLE core.tenant (
    id            UNIQUEIDENTIFIER PRIMARY KEY,
    [name]          NVARCHAR(255) NOT NULL,
    tenancy_code   UNIQUEIDENTIFIER,
    -- Location 
    
    country       NVARCHAR(50)  NOT NULL,
    city          NVARCHAR(50)  NOT NULL,
    -- address       NVARCHAR(500) NULL,

    --  state
    

    -- Contact
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


CREATE TABLE inv.screen (
    id                   UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id            UNIQUEIDENTIFIER NOT NULL,

    -- Identification
    [name]                 NVARCHAR(255) NOT NULL,
    [location]             NVARCHAR(500) NOT NULL,
    [address]              NVARCHAR(500) NULL,
    city                 NVARCHAR(100) NULL,
    country              NVARCHAR(100) NULL,

    -- Resolution
    -- screen_width_px      INT NOT NULL,
    -- screen_height_px     INT NOT NULL,
    orientation          NVARCHAR(10) NOT NULL CHECK (orientation IN ('portrait', 'landscape', 'square')),

    -- Physical dimensions
    area_sq_m            DECIMAL(10,2) NULL,

    -- Scheduling
    -- timezone             NVARCHAR(100) NOT NULL,

    -- Device identity
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
