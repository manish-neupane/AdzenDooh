using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Model.Application.Inventory.Screen
{
    public class MvScreenDetailParam
    {
        public int ScreenId { get; set; }
        public int TenantId { get; set; }
    }

    public class MvScreenDetail
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Location { get; set; } = null!;
        public string? Address { get; set; }
        public string Status { get; set; } = null!;
        public string? Resolution { get; set; }
        public string Orientation { get; set; } = null!;
        public string MacAddress { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        public List<MvScreenDetailCampaign> Campaigns { get; set; } = [];
        public List<MvScreenDetailOperatingHour> OperatingHours { get; set; } = [];
    }

    public class MvScreenDetailCampaign
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Status { get; set; }
        public int DurationInDays { get; set; }
        public string? Remarks { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class MvScreenDetailOperatingHour
    {
        public int Id { get; set; }
        public int DayOfWeek { get; set; }
        public string StartTime { get; set; } = null!;
        public string EndTime { get; set; } = null!;
        public int? AverageAudienceCount { get; set; }
    }
}
