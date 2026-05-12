using System;
using System.Collections.Generic;

namespace AdzenDooh.Model.Application.Campaign;

// --- Filters ---

// ── Filters ───────────────────────────────────────────────────────────────────

public class MvCampaignFilter
{
    public int? Status { get; set; }
    public string? SearchText { get; set; }
}

public class MvCampaignCreativeFilter
{
    public DateOnly? PlayDate { get; set; }
}

// ── Grid Requests ─────────────────────────────────────────────────────────────

public class MvCampaignGridRequest
{
    public int TenantId { get; set; }
    public int Offset { get; set; }
    public int PageSize { get; set; }
    public MvCampaignFilter? Filter { get; set; }
}

public class MvCampaignCreativeGridRequest
{
    public int CampaignId { get; set; }
    public int ScreenId { get; set; }
    public int Offset { get; set; }
    public int PageSize { get; set; }
    public MvCampaignCreativeFilter? Filter { get; set; }
}

// ── Detail Request ────────────────────────────────────────────────────────────

public class MvCampaignDetailRequest
{
    public int CampaignId { get; set; }
    public int TenantId { get; set; }
}

// ── Insert Requests ───────────────────────────────────────────────────────────

public class MvCreateCampaign
{
    public int TenantId { get; set; }
    public int CreatedBy { get; set; }
    public required string Name { get; set; }
    public string? Remarks { get; set; }
    public List<MvCampaignScreenRef> Screens { get; set; } = [];
    public List<MvCampaignDateRef> Dates { get; set; } = [];
}

public class MvCampaignScreenRef
{
    public int ScreenId { get; set; }
}

public class MvCampaignDateRef
{
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}

public class MvSaveCampaignCreative
{
    public int CampaignId { get; set; }
    public int CreatedBy { get; set; }
    public List<MvCreativeScreen> Screens { get; set; } = [];
}

public class MvCreativeScreen
{
    public int ScreenId { get; set; }
    public DateOnly PlayDate { get; set; }
    public List<MvCreativeItem> Creatives { get; set; } = [];
}

public class MvCreativeItem
{
    public int CreativeId { get; set; }
    public int PlaySequence { get; set; }
}

// ── Grid Row (SpCampaignSel) ──────────────────────────────────────────────────

public class MvCampaign
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Remarks { get; set; }
    public int Status { get; set; }
    public int DurationInDays { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
}

// ── Detail (SpCampaignDetailSel) ──────────────────────────────────────────────

public class MvCampaignDetail
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Remarks { get; set; }
    public int Status { get; set; }
    public int DurationInDays { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }

    public List<MvCampaignScreen> Screens { get; set; } = [];
    public List<MvCampaignDate> Dates { get; set; } = [];
}

public class MvCampaignScreen
{
    public int ScreenId { get; set; }
    public required string ScreenName { get; set; }
    public required string Location { get; set; }
}

public class MvCampaignDate
{
    public int CampaignDateId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class MvCampaignCreative
{
    public int CampaignCreativeId { get; set; }
    public int CreativeId { get; set; }
    public required string CreativeName { get; set; }
    public bool IsVideo { get; set; }
    public required string Extension { get; set; }
    public DateTime PlayDate { get; set; }
    public int PlaySequence { get; set; }
    public DateTime CreatedAt { get; set; }
}