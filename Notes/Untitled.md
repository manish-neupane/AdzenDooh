```markdown
# DOOH Ad Manager — Final DB Schema (GUID = NEWID)

## Overview

- Multi-tenant system
- Each table -> tenant_id
- Soft delete -> deleted_at
- Audit -> created_by, updated_by, deleted_by
- IDs -> NEWID() (simpler than sequential)

---

# Schema: auth

## Tenant

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
```

```sql
CREATE UNIQUE INDEX uq_tenant_name 
ON auth.tenant(name) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_tenant_slug 
ON auth.tenant(slug) WHERE deleted_at IS NULL;
```

<br>

## User

```sql
CREATE TABLE auth.[user] (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
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
```

```sql
CREATE UNIQUE INDEX uq_user_email 
ON auth.[user](tenant_id, email) WHERE deleted_at IS NULL;
```

---

# Schema: asset

## Screen

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

<br>

## Ad

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

# Schema: camp

## Campaign

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

<br>

## Campaign Ad (Junction)

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

<br>

## Campaign Screen (Junction)

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

# Schema: play

## Proof of Play

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

# Schema: audit

```sql
CREATE SCHEMA audit;
-- Future tables: audit_log, change_history, etc.
```

---

# Final Mental Model

```text
Tenant
 ├── Users
 ├── Screens
 ├── Ads
 ├── Campaigns
 │     ├── campaign_ad
 │     └── campaign_screen
 └── proof_of_play
```

---

# Key Notes

| Feature | Purpose |
|---------|---------|
| width/height | Ensures display compatibility |
| orientation | Quick filtering for playlist |
| CHECK constraints | Prevents bad data at database level |
| soft delete (deleted_at) | Safe recovery of deleted records |
| GUID (NEWID) | Simple, flexible, no coordination needed |
| tenant_id | Row-level multi-tenant isolation |
```