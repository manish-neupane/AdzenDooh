using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Model.Application.Inventory.ScreenOperatingHour
{
  
        public class MvScreenOperatingHour
        {
            public int Id { get; set; }
            public int ScreenId { get; set; }
            public byte DayOfWeek { get; set; }
            public DateTime StartTime { get; set; }
            public DateTime EndTime { get; set; }
            public int? AverageAudienceCount { get; set; }
            public DateTime CreatedAt { get; set; }
            public int CreatedBy { get; set; }
        }
    
}
