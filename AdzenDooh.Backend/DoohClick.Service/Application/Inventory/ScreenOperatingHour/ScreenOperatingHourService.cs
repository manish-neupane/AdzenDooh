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
        // ── GET SLOTS ----------------------------------------------
        public async Task<List<MvScreenOperatingHour>?> GetSlots(
            MvScreenOperatingHourFilter param)
        {
            try
            {
                string result = await _DataAccessService.RetrievalProcedure(
                    "inv.SpScreenOperatingHourSel", JsonConvert.SerializeObject(param));

                if (!result.TrimStart().StartsWith('['))
                {
                    var spError = JsonConvert.DeserializeObject<MvSpError>(result);
                    throw new InvalidOperationException(spError?.Message ?? "An error occurred");
                }

                return JsonConvert.DeserializeObject<List<MvScreenOperatingHour>>(result);
            }
            catch { throw; }
        }

        // ── ADD SLOTS -----------------------------------------------
        public async Task<List<MvScreenOperatingHour>?> AddSlots(
            List<MvAddScreenOperatingHour> param)
        {
            try
            {
                string result = await _DataAccessService.ActionProcedure(
                    "inv.SpScreenOperatingHourIns", JsonConvert.SerializeObject(param));

                if (!result.TrimStart().StartsWith('['))
                {
                    var spError = JsonConvert.DeserializeObject<MvSpError>(result);
                    throw new InvalidOperationException(spError?.Message ?? "An error occurred");
                }

                return JsonConvert.DeserializeObject<List<MvScreenOperatingHour>>(result);
            }
            catch { throw; }
        }

        // ── DELETE SLOT ------------------------------------------------
        public async Task DeleteSlot(MvDeleteScreenOperatingHour param)
        {
            try
            {
                string result = await _DataAccessService.ActionProcedure(
                    "inv.SpScreenOperatingHourDel", JsonConvert.SerializeObject(param));

                var response = JsonConvert.DeserializeObject<MvSpError>(result);

                if (response?.Type != "Success")
                    throw new InvalidOperationException(response?.Message ?? "An error occurred");
            }
            catch { throw; }
        }
    }
}