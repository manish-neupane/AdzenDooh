using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Model.Application.Inventory.Screen
{


        public class MvScreen
        {
            public required int Id { get; set; }
            public required int TenantId { get; set; }
            public required string Name { get; set; }
            public required string MacAddress { get; set; }
            public required string Location { get; set; }
            public required string Address { get; set; }
            public required string Status { get; set; }
            public required string Resolution { get; set; }
            public required string Orientation { get; set; }
            public DateTime CreatedAt { get; set; }
            public required int CreatedBy { get; set; }
            public DateTime? UpdatedAt { get; set; }
            public int? UpdatedBy { get; set; }
        }



    // Filter class for MvScreen
    public class MvScreenFilter
     {
        public string? Status { get; set; }
        public string? Orientation { get; set; }
        public string? SearchText { get; set; }
       }


    // DTO for creating/updating MvScreen

    public class MvUpsertScreen
    {
        public int? Id { get; set; } 

        public required int TenantId { get; set; }
        public required string Name { get; set; } = null!;
         public required string MacAddress { get; set; } = null!;
        public required string Location { get; set; } = null!;
        public string? Address { get; set; }
        public required string Status { get; set; } 
        public string? Resolution { get; set; }
        public required string Orientation { get; set; } = null!;

        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }


    public class MvDeleteScreen
    {
        public int Id { get; set; }
        public int DeletedBy { get; set; }
    }

}

