
    CREATE TABLE asset.screen (
    id                   UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id            UNIQUEIDENTIFIER NOT NULL
                         REFERENCES auth.tenant(id),

    -- Identification
    name                 NVARCHAR(255)    NOT NULL,
    location             NVARCHAR(500)    NOT NULL,
    address              NVARCHAR(500)    NOT NULL,
    city                 NVARCHAR(100)    NOT NULL,
    country              NVARCHAR(100)    NOT NULL,

    -- Resolution (pixel grid)
    screen_width_px      INT              NOT NULL,   -- hardware pixel width
    screen_height_px     INT              NOT NULL,   -- hardware pixel height
    orientation          NVARCHAR(10)     NOT NULL
                         DEFAULT 'landscape'
                         CHECK (orientation IN ('landscape', 'portrait')),

    -- Physical size (real-world dimensions)
    physical_width_mm    INT              NOT NULL,   -- physical width in millimeters
    physical_height_mm   INT              NOT NULL,   -- physical height in millimeters
    diagonal_inches      DECIMAL(5,2)     NULL,       -- optional, can be derived

    -- Device identity
    mac_address          NVARCHAR(17)     NOT NULL UNIQUE, -- enforce uniqueness

    -- Operator assignment (inline or junction table)
    operator_id          UNIQUEIDENTIFIER NULL
                         REFERENCES auth.[user](id),

    -- Lifecycle status
    status               NVARCHAR(20)     NOT NULL
                         DEFAULT 'active'
                         CHECK (status IN ('active', 'inactive', 'maintenance')),
    last_seen_at         DATETIME2(0)     NULL,

    -- Audit
    created_by           UNIQUEIDENTIFIER NOT NULL
                         REFERENCES auth.[user](id),
    created_at           DATETIME2(0)     NOT NULL
                         DEFAULT GETUTCDATE(),
    updated_by           UNIQUEIDENTIFIER NULL
                         REFERENCES auth.[user](id),
    updated_at           DATETIME2(0)     NULL,
    deleted_by           UNIQUEIDENTIFIER NULL
                         REFERENCES auth.[user](id),
    deleted_at           DATETIME2(0)     NULL);






                                  Ad
    
    
    CREATE TABLE asset.ad (
    id                  UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id           UNIQUEIDENTIFIER NOT NULL
                        REFERENCES auth.tenant(id),

    -- Metadata
    title               NVARCHAR(255)    NOT NULL,
    media_url           NVARCHAR(1000)   NOT NULL,
    file_name           NVARCHAR(255)    NOT NULL,
    file_size_bytes     BIGINT           NOT NULL,
    media_type          NVARCHAR(20)     NOT NULL
                        CHECK (media_type IN ('image','video')),

    -- Resolution (creative asset dimensions)
    ad_width_px         INT              NOT NULL,   -- pixel width
    ad_height_px        INT              NOT NULL,   -- pixel height
    resolution_category NVARCHAR(50)     NULL,       -- optional enum (720p, 1080p, 4K)
    orientation         NVARCHAR(10)     NOT NULL
                        DEFAULT 'landscape'
                        CHECK (orientation IN ('landscape','portrait')),

    -- Playback
    duration_seconds    INT NULL
                        CHECK (duration_seconds IS NULL OR duration_seconds > 0),

    -- Workflow state
    status              NVARCHAR(20)     NOT NULL
                        DEFAULT 'draft'
                        CHECK (status IN ('draft','under_review','approved','rejected','expired')),
    rejection_reason    NVARCHAR(500)    NULL,

    -- Audit
    created_by          UNIQUEIDENTIFIER NOT NULL
                        REFERENCES auth.[user](id),
    created_at          DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
    updated_by          UNIQUEIDENTIFIER NULL
                        REFERENCES auth.[user](id),
    updated_at          DATETIME2(0)     NULL,
    deleted_by          UNIQUEIDENTIFIER NULL
                        REFERENCES auth.[user](id),
    deleted_at          DATETIME2(0)     NULL,

    -- Compound constraints
    CONSTRAINT CK_ad_duration CHECK (
        (media_type = 'video' AND duration_seconds IS NOT NULL AND duration_seconds > 0)
        OR (media_type = 'image' AND (duration_seconds IS NULL OR duration_seconds > 0))
    ),
    CONSTRAINT CK_ad_orientation CHECK (
        (orientation = 'landscape' AND ad_width_px >= ad_height_px)
        OR (orientation = 'portrait'  AND ad_height_px > ad_width_px)
    ));

                                 Campaign
    
    
     CREATE TABLE camp.campaign (
    id               UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id        UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    name             NVARCHAR(255)    NOT NULL,
    start_time       DATETIME2(0)     NOT NULL,
    end_time         DATETIME2(0)     NOT NULL CHECK (end_time > start_time),
    status           NVARCHAR(20)     NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'scheduled', 'active', 'ended', 'cancelled')),
    rejection_reason NVARCHAR(500)    NULL,
    
    created_by       UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at       DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
    updated_by       UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    updated_at       DATETIME2(0)     NULL,
    deleted_by       UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    deleted_at       DATETIME2(0)     NULL
    -- APPLICATION LAYER: enforce valid status transitions (draft→submitted→approved→scheduled→active→ended, etc.)
    -- APPLICATION LAYER: prevent skipping states (e.g., draft→active directly)
);





                          Campaign_ad
    CREATE TABLE camp.campaign_ad (
    id          UNIQUEIDENTIFIER PRIMARY KEY ,
    tenant_id   UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    campaign_id UNIQUEIDENTIFIER NOT NULL REFERENCES camp.campaign(id),
    ad_id       UNIQUEIDENTIFIER NOT NULL REFERENCES asset.ad(id),
    play_order  INT              NOT NULL CHECK (play_order >= 1),
    
    created_by  UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at  DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
    updated_by  UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    updated_at  DATETIME2(0)     NULL,
    deleted_by  UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    deleted_at  DATETIME2(0)     NULL,

    UNIQUE (campaign_id, play_order),
    UNIQUE (campaign_id, ad_id)
    -- APPLICATION LAYER: enforce that play_order is sequential with no gaps (DB only enforces uniqueness, not sequence continuity).
     );


                
						Campaign_screen
      CREATE TABLE camp.campaign_screen (
    id          UNIQUEIDENTIFIER PRIMARY KEY ,
    tenant_id   UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    campaign_id UNIQUEIDENTIFIER NOT NULL REFERENCES camp.campaign(id),
    screen_id   UNIQUEIDENTIFIER NOT NULL REFERENCES asset.screen(id),
  
    created_by  UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at  DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
    updated_by  UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    updated_at  DATETIME2(0)     NULL,
    deleted_by  UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    deleted_at  DATETIME2(0)     NULL,

    UNIQUE (campaign_id, screen_id)
    -- APPLICATION LAYER: enforce business rules like screen compatibility (resolution/orientation match).
    );


                          Campaign_time_window

     CREATE TABLE camp.campaign_time_window (
    id               UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id        UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    campaign_id      UNIQUEIDENTIFIER NOT NULL REFERENCES camp.campaign(id),

    window_type      NVARCHAR(20) NOT NULL CHECK (window_type IN ('always', 'daily', 'weekly')),
    start_time       TIME NULL,
    end_time         TIME NULL,
    days_of_week     NVARCHAR(50) NULL,  -- validated in backend
    frequency_seconds INT NULL CHECK (frequency_seconds IS NULL OR frequency_seconds >= 10),

    created_at       DATETIME2(0) NOT NULL DEFAULT GETUTCDATE(),
    created_by       UNIQUEIDENTIFIER NOT NULL,
    updated_at       DATETIME2(0) NULL,
    updated_by       UNIQUEIDENTIFIER NULL,
    deleted_at       DATETIME2(0) NULL,
    deleted_by       UNIQUEIDENTIFIER NULL

    -- APPLICATION LAYER: enforce compound rules:
    --   if window_type = 'daily' → require start_time + end_time
    --   if window_type = 'weekly' → require days_of_week + start_time + end_time
    --   if window_type = 'always' → allow NULLs
    -- APPLICATION LAYER: restrict frequency_seconds usage to daily/weekly only);

