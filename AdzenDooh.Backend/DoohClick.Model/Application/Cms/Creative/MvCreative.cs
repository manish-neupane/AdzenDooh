using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Model.Application.Cms.Creative
{
    public class MvCreative
    {
        public required int Id { get; set; }
        public required int TenantId { get; set; }
        public required string Name { get; set; }
        public required  string Url { get; set; }
        public required bool IsVideo { get; set; }
        public required string Extension { get; set; }
        public required string Resolution { get; set; }
        public required string Orientation { get; set; }
        public int? DurationSecond { get; set; }
        public required DateTime CreatedAt { get; set; }
        public required int CreatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }
    }


    public class MvAddCreative
    {
        public int TenantId { get; set; }
        public  required string Name { get; set; }
        public required string Url { get; set; }
        public bool IsVideo { get; set; }
        public required string Extension { get; set; }
        public required string Resolution { get; set; }
        public required string Orientation { get; set; }
        public int? DurationSecond { get; set; }
        public int CreatedBy { get; set; }
    }

    public class MvDeleteCreative
    {
        public required int Id { get; set; }
        public required int TenantId { get; set; }
        public required int DeletedBy { get; set; }
    }

    public class MvCreativeFilter
    {
        public bool? IsVideo { get; set; }
        public string? Orientation { get; set; }
        public string? SearchText { get; set; }
    }

    public class MvTenantId { 
       public int TenantId { get; set; }
     }
    public class MvCreativeUpload
    {
        public int TenantId { get; set; }
        public required string Name { get; set; } 
        public int CreatedBy { get; set; }
    }

    public class MvCreativeDdl
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public bool IsVideo { get; set; }
    }
}
