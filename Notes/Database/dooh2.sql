
    -- Schema: auth

    CREATE SCHEMA auth;
    GO

    CREATE TABLE auth.tenant (
        id            UNIQUEIDENTIFIER PRIMARY KEY,
        [name]        NVARCHAR(255)    NOT NULL UNIQUE,
        country       NVARCHAR(50)     NOT NULL,
        city          NVARCHAR(50)     NOT NULL,
        is_active     BIT              NOT NULL DEFAULT 1,
        is_deleted    BIT              NOT NULL DEFAULT 0,
        contact_email NVARCHAR(255)    NOT NULL,

        created_at    DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
        created_by    UNIQUEIDENTIFIER NULL,
        updated_at    DATETIME2(0)     NULL,
        updated_by    UNIQUEIDENTIFIER NULL,
        deleted_at    DATETIME2(0)     NULL,
        deleted_by    UNIQUEIDENTIFIER NULL
    );

    CREATE TABLE auth.[user] (
        id            UNIQUEIDENTIFIER PRIMARY KEY,
        tenant_id     UNIQUEIDENTIFIER NULL     REFERENCES auth.tenant(id),
        email         NVARCHAR(255)    NOT NULL,
        password_hash NVARCHAR(512)    NOT NULL,
        full_name     NVARCHAR(255)    NOT NULL,
        [role]        NVARCHAR(20)     NOT NULL DEFAULT 'operator'
                    CHECK (role IN ('super_admin', 'tenant_admin', 'operator', 'system')),
        is_active     BIT              NOT NULL DEFAULT 1,
        is_deleted    BIT              NOT NULL DEFAULT 0,

        created_by    UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        created_at    DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
        updated_by    UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        updated_at    DATETIME2(0)     NULL,
        deleted_by    UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        deleted_at    DATETIME2(0)     NULL,

        UNIQUE (tenant_id, email)
    );
    GO

    -- Schema: asset

    CREATE SCHEMA asset;
    GO

    CREATE TABLE asset.screen (
        id                   UNIQUEIDENTIFIER PRIMARY KEY,
        tenant_id            UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),

        -- Identification
        [name]               NVARCHAR(255)    NOT NULL,
        [location]           NVARCHAR(500)    NOT NULL,
        [address]            NVARCHAR(500)    NULL,
        city                 NVARCHAR(100)    NULL,
        country              NVARCHAR(100)    NULL,

        -- Resolution
        screen_width_px      INT              NOT NULL,
        screen_height_px     INT              NOT NULL,
        orientation          NVARCHAR(10)     NOT NULL DEFAULT 'landscape'
                            CHECK (orientation IN ('landscape', 'portrait')),

        -- Physical dimensions
        physical_width_mm    INT              NULL,
        physical_height_mm   INT              NULL,
        diagonal_inches      DECIMAL(5,2)     NULL,

        -- Scheduling
        timezone             NVARCHAR(100)    NOT NULL DEFAULT 'UTC',

        -- Device identity
        mac_address          NVARCHAR(17)     NULL,

        -- Assignment
        operator_id          UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),

        -- Lifecycle
        [status]             NVARCHAR(20)     NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'inactive', 'maintenance')),
        last_seen_at         DATETIME2(0)     NULL,
        is_deleted           BIT              NOT NULL DEFAULT 0,

        -- Audit
        created_by           UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
        created_at           DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
        updated_by           UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        updated_at           DATETIME2(0)     NULL,
        deleted_by           UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        deleted_at           DATETIME2(0)     NULL
    );

    CREATE TABLE asset.ad (
        id                   UNIQUEIDENTIFIER PRIMARY KEY,
        tenant_id            UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),

        -- Metadata
        title                NVARCHAR(255)    NOT NULL,
        media_url            NVARCHAR(1000)   NOT NULL,
        file_name            NVARCHAR(255)    NOT NULL,
        file_size_bytes      BIGINT           NOT NULL,
        media_type           NVARCHAR(20)     NOT NULL
                            CHECK (media_type IN ('image', 'video')),

        -- Resolution — set by backend media analysis pipeline
        ad_width_px          INT              NOT NULL,
        ad_height_px         INT              NOT NULL,
        resolution_category  NVARCHAR(50)     NULL,    -- e.g. 720p, 1080p, 4K
        orientation          NVARCHAR(10)     NOT NULL DEFAULT 'landscape'
                            CHECK (orientation IN ('landscape', 'portrait')),

        -- Playback — NULL allowed for images
        duration_seconds     INT              NULL
                            CHECK (duration_seconds IS NULL OR duration_seconds > 0),

        -- Workflow
        [status]             NVARCHAR(20)     NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'under_review', 'approved', 'rejected', 'expired')),
        rejection_reason     NVARCHAR(500)    NULL,
        is_deleted           BIT              NOT NULL DEFAULT 0,

        -- video must have duration; image duration is optional
        CONSTRAINT CK_ad_duration CHECK (
            (media_type = 'video' AND duration_seconds IS NOT NULL AND duration_seconds > 0)
            OR
            (media_type = 'image' AND (duration_seconds IS NULL OR duration_seconds > 0))
        ),

        -- Audit
        created_by           UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
        created_at           DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
        updated_by           UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        updated_at           DATETIME2(0)     NULL,
        deleted_by           UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        deleted_at           DATETIME2(0)     NULL
    );
    GO

    -- =============================================
    -- Schema: serve
    -- =============================================
    CREATE SCHEMA serve;
    GO

    CREATE TABLE serve.campaign (
        id               UNIQUEIDENTIFIER PRIMARY KEY,
        tenant_id        UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
        [name]           NVARCHAR(255)    NOT NULL,
        start_time       DATETIME2(0)     NOT NULL,
        end_time         DATETIME2(0)     NOT NULL CHECK (end_time > start_time),
        [status]         NVARCHAR(20)     NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'scheduled', 'active', 'ended', 'cancelled')),
        rejection_reason NVARCHAR(500)    NULL,
        is_deleted       BIT              NOT NULL DEFAULT 0,

        created_by       UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
        created_at       DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
        updated_by       UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        updated_at       DATETIME2(0)     NULL,
        deleted_by       UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        deleted_at       DATETIME2(0)     NULL
    );

    CREATE TABLE serve.campaign_ad (
        id          UNIQUEIDENTIFIER PRIMARY KEY,
        tenant_id   UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
        campaign_id UNIQUEIDENTIFIER NOT NULL REFERENCES serve.campaign(id),
        ad_id       UNIQUEIDENTIFIER NOT NULL REFERENCES asset.ad(id),
        play_order  INT              NOT NULL CHECK (play_order >= 1),
        is_deleted  BIT              NOT NULL DEFAULT 0,

        created_by  UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
        created_at  DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
        updated_by  UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        updated_at  DATETIME2(0)     NULL,
        deleted_by  UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        deleted_at  DATETIME2(0)     NULL
    );

    CREATE TABLE serve.campaign_screen (
        id          UNIQUEIDENTIFIER PRIMARY KEY,
        tenant_id   UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
        campaign_id UNIQUEIDENTIFIER NOT NULL REFERENCES serve.campaign(id),
        screen_id   UNIQUEIDENTIFIER NOT NULL REFERENCES asset.screen(id),
        is_deleted  BIT              NOT NULL DEFAULT 0,

        created_by  UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
        created_at  DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
        updated_by  UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        updated_at  DATETIME2(0)     NULL,
        deleted_by  UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        deleted_at  DATETIME2(0)     NULL
    );

    CREATE TABLE serve.campaign_time_window (
        id                UNIQUEIDENTIFIER PRIMARY KEY,
        tenant_id         UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
        campaign_id       UNIQUEIDENTIFIER NOT NULL REFERENCES serve.campaign(id),
        window_type       NVARCHAR(20)     NOT NULL
                        CHECK (window_type IN ('always', 'daily', 'weekly')),
        start_time        TIME             NULL,
        end_time          TIME             NULL,
        days_of_week      NVARCHAR(50)     NULL
                        CHECK (days_of_week IS NULL OR LEN(TRIM(days_of_week)) > 0),
        frequency_seconds INT              NULL
                        CHECK (frequency_seconds IS NULL OR frequency_seconds >= 10),
        is_deleted        BIT              NOT NULL DEFAULT 0,

        CONSTRAINT CHK_window_always CHECK (
            window_type <> 'always'
            OR (start_time IS NULL AND end_time IS NULL AND days_of_week IS NULL)
        ),
        CONSTRAINT CHK_window_daily CHECK (
            window_type <> 'daily'
            OR (start_time IS NOT NULL AND end_time IS NOT NULL)
        ),
        CONSTRAINT CHK_window_weekly CHECK (
            window_type <> 'weekly'
            OR (start_time IS NOT NULL AND end_time IS NOT NULL AND days_of_week IS NOT NULL)
        ),

        created_by        UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
        created_at        DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
        updated_by        UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        updated_at        DATETIME2(0)     NULL,
        deleted_by        UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        deleted_at        DATETIME2(0)     NULL
    );
    GO

    -- =============================================
    -- Schema: stat
    -- =============================================
    CREATE SCHEMA stat;
    GO

    CREATE TABLE stat.proof_of_play (
        id               UNIQUEIDENTIFIER PRIMARY KEY,
        tenant_id        UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
        screen_id        UNIQUEIDENTIFIER NOT NULL REFERENCES asset.screen(id),
        ad_id            UNIQUEIDENTIFIER NOT NULL REFERENCES asset.ad(id),
        campaign_id      UNIQUEIDENTIFIER NOT NULL REFERENCES serve.campaign(id),
        played_at        DATETIME2(3)     NOT NULL DEFAULT GETUTCDATE(),
        duration_seconds INT              NOT NULL CHECK (duration_seconds >= 0),
        [status]         NVARCHAR(20)     NOT NULL DEFAULT 'completed'
                        CHECK (status IN ('completed', 'interrupted')),

        created_by       UNIQUEIDENTIFIER NULL     REFERENCES auth.[user](id),
        created_at       DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE()
    );
    GO