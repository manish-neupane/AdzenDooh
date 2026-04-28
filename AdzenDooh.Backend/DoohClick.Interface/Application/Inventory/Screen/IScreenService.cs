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
        Task<GridResponse<MvScreen>?> GetGrid(MvParamOption<MvScreenFilter> param);
        
        Task<List<MvScreen>?> SaveScreen(MvUpsertScreen param);

        Task<List<MvDropdown>?> ScreenDdl(MvDropdown param);

        Task<List<MvScreen>?> DeleteScreen(MvDeleteScreen param);


     }
}
