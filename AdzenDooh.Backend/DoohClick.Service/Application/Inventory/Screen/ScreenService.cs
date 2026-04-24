using AdzenDooh.Interface.Application.Inventory.Screen;
using AdzenDooh.Model.Application.Inventory.Screen;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using DoohClick.DataAccess;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Service.Application.Inventory.Screen
{
    public class ScreenService(IDataAccessService ds) : IScreenService
    {
      

        public async Task<GridResponse<MvScreen>?> ScreenGrid(MvParamOption<MvScreenFilter> param) { 
       
            try
            {
                string result = await ds.RetrievalProcedure("Inv.SpScreenSel", JsonConvert.SerializeObject(param));
                return JsonConvert.DeserializeObject<GridResponse<MvScreen>>(result);
            }
            catch (Exception)
            {
                throw;
            }
        }


       public async  Task<List<MvScreen>?> UpsertScreen(MvUpsertScreen param)
        {
            throw new NotImplementedException();
        }




        public Task<List<MvScreen>?> DeleteScreen(MvDeleteScreen param)
        {
            throw new NotImplementedException();
        }

        public Task<List<MvDropdown>?> ScreenDdl(MvDropdown param)
        {
            throw new NotImplementedException();
        }
    }
}
