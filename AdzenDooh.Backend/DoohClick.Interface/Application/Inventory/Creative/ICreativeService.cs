using AdzenDooh.Model.Application.Inventory.Creative;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using Microsoft.AspNetCore.Http;

namespace AdzenDooh.Interface.Application.Inventory.Creative
{
    public interface ICreativeService
    {
        Task<GridResponse<MvCreative>?> CreativeGrid(MvParamOption<MvCreativeFilter> param);
        Task<List<MvCreative>?> AddCreative(MvAddCreative param);
        Task<List<MvDropdown>?> CreativeDdl(MvDropdown param);
        Task<List<MvCreative>?> UploadAndAddCreative(IFormFile file, MvCreativeUpload upload, string wwwRootPath); 
        Task<List<MvCreative>?> DeleteCreative(MvDeleteCreative param);
    }
}