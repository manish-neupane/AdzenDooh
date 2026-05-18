using AdzenDooh.Interface.Application.Inventory.ScreenOperatingHour;
using AdzenDooh.Model.Application.Inventory.ScreenOperatingHour;
using AdzenDooh.Model.Shared.SpError;
using DoohClick.DataAccess;
using Newtonsoft.Json;

namespace AdzenDooh.Service.Application.Inventory.ScreenOperatingHour
{
    public class ScreenOperatingHourService(
        IDataAccessService _DataAccessService
    ) : IScreenOperatingHourService
    {
      
        public async Task<List<MvScreenOperatingHour>?> GetHours(MvScreenOperatingHourFilter param)
        {
            string result = await _DataAccessService.RetrievalProcedure(
                "inv.SpScreenOperatingHourSel", JsonConvert.SerializeObject(param));

            return JsonConvert.DeserializeObject<List<MvScreenOperatingHour>>(result);
        }

        
        public async Task<List<MvScreenOperatingHour>?> AddHours(List<MvAddScreenOperatingHour> param)
        {
            string result = await _DataAccessService.ActionProcedure(
                "inv.SpScreenOperatingHourIns", JsonConvert.SerializeObject(param));

            return JsonConvert.DeserializeObject<List<MvScreenOperatingHour>>(result);
        }

        //  DELETE HOUR 
        public async Task DeleteHour(MvDeleteScreenOperatingHour param)
        {
            string result = await _DataAccessService.ActionProcedure("inv.SpScreenOperatingHourDel", JsonConvert.SerializeObject(param));

            var response = JsonConvert.DeserializeObject<MvSpError>(result);

            if (response?.Type != "Success")
                throw new InvalidOperationException(response?.Message ?? "An error occurred");
        }
    }
}