# DOOH AD MANAGER — Database Schema

## Schema: `auth`

```sql
CREATE SCHEMA auth;
GO

CREATE TABLE auth.tenant (
    id            UNIQUEIDENTIFIER PRIMARY KEY,
    name          NVARCHAR(255)    NOT NULL UNIQUE,
    country       NVARCHAR(50)     NOT NULL
    city          NVARCHAR(50)     NOT NULL
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
    id            UNIQUEIDENTIFIER PRIMARY KEY ,
	tenant_id     UNIQUEIDENTIFIER NULL REFERENCES auth.tenant(id),
    email         NVARCHAR(255)    NOT NULL,
    password_hash NVARCHAR(512)    NOT NULL,
    full_name     NVARCHAR(255)    NOT NULL,
    role          NVARCHAR(20)     NOT NULL DEFAULT 'operator' CHECK (role IN ('super_admin', 'tenant_admin', 'operator', 'system')),
    is_active     BIT              NOT NULL DEFAULT 1,
    is_deleted    BIT              NOT NULL DEFAULT 0,

    created_by    UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at    DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
    updated_by    UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    updated_at    DATETIME2(0)     NULL,
    deleted_by    UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    deleted_at    DATETIME2(0)     NULL,
    UNIQUE (tenant_id, email)
);
```

## Schema: `asset`

```sql
CREATE SCHEMA asset;
GO

CREATE TABLE asset.screen (
    id           UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id    UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    name         NVARCHAR(255)    NOT NULL,
    location     NVARCHAR(500)    NOT NULL,
    address      NVARCHAR(500)    NULL,
    city         NVARCHAR(100)    NULL,
    country      NVARCHAR(100)    NULL,
    width        INT              NOT NULL,
    height       INT              NOT NULL,
    default_resolution NVARCHAR(100)   NOT NULL
    orientation  NVARCHAR(10)     NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
    mac_address  NVARCHAR(17)     NULL,
    operator_id  UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    status       NVARCHAR(20)     NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    last_seen_at DATETIME2(0)     NULL,
   
    created_by   UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at   DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
    updated_by   UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    updated_at   DATETIME2(0)     NULL,
    deleted_by   UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    deleted_at   DATETIME2(0)     NULL
);













CREATE TABLE asset.ad (
    id               UNIQUEIDENTIFIER PRIMARY KEY ,
    tenant_id        UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    title            NVARCHAR(255)    NOT NULL,
    media_url        NVARCHAR(1000)   NOT NULL,
    file_name        NVARCHAR(255)    NOT NULL,
    file_size_bytes  BIGINT           NOT NULL,
    default_resolution NVARCHAR(100)   NOT NULL
    media_type       NVARCHAR(20)     NOT NULL CHECK (media_type IN ('image', 'video')),
    duration_seconds INT              NOT NULL CHECK (duration_seconds > 0),
    orientation      NVARCHAR(10)     NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
    status           NVARCHAR(20)     NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'rejected', 'expired')),
    rejection_reason NVARCHAR(500)    NULL,

    created_by       UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at       DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
    updated_by       UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    updated_at       DATETIME2(0)     NULL,
    deleted_by       UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    deleted_at       DATETIME2(0)     NULL
);
```

## Schema: `camp`

```sql
CREATE SCHEMA camp;
GO

CREATE TABLE camp.campaign (
    id               UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id        UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    name             NVARCHAR(255)    NOT NULL,
    start_time       DATETIME2(0)     NOT NULL,
    end_time         DATETIME2(0)     NOT NULL CHECK (end_time > start_time),
    status           NVARCHAR(20)     NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'scheduled', 'active', 'ended', 'cancelled')),
    rejection_reason NVARCHAR(500)    NULL,
    
    created_by       UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at       DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE(),
    updated_by       UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    updated_at       DATETIME2(0)     NULL,
    deleted_by       UNIQUEIDENTIFIER NULL REFERENCES auth.[user](id),
    deleted_at       DATETIME2(0)     NULL
);





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
);





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
);
```

## Schema: `play`

```sql
CREATE SCHEMA play;
GO

CREATE TABLE play.proof_of_play (
    id               UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id        UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    screen_id        UNIQUEIDENTIFIER NOT NULL REFERENCES asset.screen(id),
    ad_id            UNIQUEIDENTIFIER NOT NULL REFERENCES asset.ad(id),
    campaign_id      UNIQUEIDENTIFIER NOT NULL REFERENCES camp.campaign(id),
    played_at        DATETIME2(3)     NOT NULL DEFAULT GETUTCDATE(),
    duration_seconds INT              NOT NULL CHECK (duration_seconds >= 0),
    status           NVARCHAR(20)     NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'interrupted')),
   
    created_by       UNIQUEIDENTIFIER NOT NULL REFERENCES auth.[user](id),
    created_at       DATETIME2(0)     NOT NULL DEFAULT GETUTCDATE()
);






CREATE TABLE camp.campaign_time_window (
    id               UNIQUEIDENTIFIER PRIMARY KEY,
    tenant_id        UNIQUEIDENTIFIER NOT NULL REFERENCES auth.tenant(id),
    campaign_id      UNIQUEIDENTIFIER NOT NULL REFERENCES camp.campaign(id),

    window_type      NVARCHAR(20) NOT NULL CHECK (window_type IN 
                        ('always', 'daily', 'weekly')),

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
);

```










- **auth** = _who can access_
    
- **asset** = _what resources exist_
    
- **serve** = _how content is delivered_
    
- **stat** = _what happened after delivery_

