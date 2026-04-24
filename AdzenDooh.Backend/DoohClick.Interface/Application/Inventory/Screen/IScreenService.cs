using AdzenDooh.Model.Application.Inventory.Screen;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Interface.Application.Inventory.Screen
{
    public interface IScreenService
    {
        Task<GridResponse<MvScreen>?> ScreenGrid(MvParamOption<MvScreenFilter> param);
        
        Task<List<MvScreen>?> UpsertScreen(MvUpsertScreen param);

        Task<List<MvDropdown>?> ScreenDdl(MvDropdown param);

        Task<List<MvScreen>?> DeleteScreen(MvDeleteScreen param);


     }
}
