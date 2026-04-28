using AdzenDooh.Interface.Application.Inventory.Screen;
using AdzenDooh.Model.Application.Inventory.Screen;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using AdzenDooh.Model.Shared.SpError;
using DoohClick.DataAccess;
using Newtonsoft.Json;



namespace AdzenDooh.Service.Application.Inventory.Screen
{
    public class ScreenService(IDataAccessService _DataAccessService) : IScreenService
    {
      

        public async Task<GridResponse<MvScreen>?> GetGrid(MvParamOption<MvScreenFilter> param) { 
       
            try
            {
                string result = await _DataAccessService.RetrievalProcedure("inv.SpScreenSel", JsonConvert.SerializeObject(param));
                return JsonConvert.DeserializeObject<GridResponse<MvScreen>>(result);
            }
            catch (Exception)
            {
                throw;
            }
        }


        public async Task<List<MvDropdown>?> ScreenDdl(MvDropdown param)
        {
            try
            {

                string result = await _DataAccessService.RetrievalProcedure("Inv.SpScreenDropSel", JsonConvert.SerializeObject(param));
                return JsonConvert.DeserializeObject<List<MvDropdown>>(result);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async  Task<List<MvScreen>?> SaveScreen(MvUpsertScreen param)
        {
            try
            {
                string result = await _DataAccessService.ActionProcedure("inv.SpScreenTsk", JsonConvert.SerializeObject(param));

                if (!result.TrimStart().StartsWith("["))
                {
                    var spError = JsonConvert.DeserializeObject<MvSpError>(result);
                    throw new InvalidOperationException(spError?.Message ?? "An error occurred");
                }
                return JsonConvert.DeserializeObject<List<MvScreen>>(result);
            }
            catch (Exception)
            {
                throw;
            }
        }




        public async Task<List<MvScreen>?> DeleteScreen(MvDeleteScreen param)
        {
            try
            {
                string result = await _DataAccessService.ActionProcedure(
                    "inv.SpScreenDel", JsonConvert.SerializeObject(param));

                var response = JsonConvert.DeserializeObject<MvSpError>(result);

                if (response?.Type != "Success")
                    throw new InvalidOperationException(response?.Message ?? "An error occurred");

                return null; 
            }
            catch { throw; }
        }


    }
}
