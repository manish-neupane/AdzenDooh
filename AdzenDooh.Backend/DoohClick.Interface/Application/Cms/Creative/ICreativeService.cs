using AdzenDooh.Model.Application.Cms.Creative;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using Microsoft.AspNetCore.Http;

namespace AdzenDooh.Interface.Application.Cms.Creative
{
    public interface ICreativeService
    {
        Task<GridResponse<MvCreative>?> GetGrid(MvParamOption<MvCreativeFilter> param);
        Task<List<MvDropdown>?> CreativeDdl(MvDropdown param);
        Task<List<MvCreative>?> SaveCreative(IFormFile file, MvCreativeUpload upload, string wwwRootPath); 
        Task<List<MvCreative>?> DeleteCreative(MvDeleteCreative param);
    }
}