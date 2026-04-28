using AdzenDooh.Model.Application.Inventory.ScreenOperatingHour;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Interface.Application.Inventory.ScreenOperatingHour
{
    public interface IScreenOperatingHourService
    {
        Task<List<MvScreenOperatingHour>?> GetSlots(MvScreenOperatingHourFilter param);
        Task<List<MvScreenOperatingHour>?> AddSlots(List<MvAddScreenOperatingHour> param);
        Task DeleteSlot(MvDeleteScreenOperatingHour param);
    }
}
