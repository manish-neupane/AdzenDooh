using AdzenDooh.Model.Application.Inventory.Creative;
using AdzenDooh.Interface.Application.Inventory.Creative;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using AdzenDooh.Model.Shared.SpError;
using DoohClick.DataAccess;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace AdzenDooh.Service.Application.Inventory.Creative
{
    public class CreativeService( IDataAccessService _DataAccessService,IFileMetadataService _MetadataService) : ICreativeService
    {
        public async Task<List<MvCreative>?> SaveCreative(
            IFormFile file,
            MvCreativeUpload upload,
            string wwwRootPath)                                         
        {
            //  Determine folder
            string ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            bool isVideo = new[] { ".mp4", ".mov", ".avi", ".mkv", ".webm", ".wmv" }
                                    .Contains(ext);
            string subFolder = isVideo ? "videos" : "images";

            //  Save file to wwwroot
            string folderPath = Path.Combine(wwwRootPath, subFolder);  // ← fixed
            Directory.CreateDirectory(folderPath);

            string uniqueName = $"{Guid.NewGuid()}{ext}";
            string fullPath = Path.Combine(folderPath, uniqueName);
            string publicUrl = $"/{subFolder}/{uniqueName}";

            await using (var stream = new FileStream(fullPath, FileMode.Create))
                await file.CopyToAsync(stream);

            //  Extract metadata
            var meta = await _MetadataService.ExtractAsync(fullPath, ext);

            // Build param and call SP
            var param = new MvAddCreative
            {
                TenantId = upload.TenantId,
                Name = upload.Name,
                Url = publicUrl,
                IsVideo = meta.IsVideo,
                Extension = meta.Extension,
                Resolution = meta.Resolution,
                Orientation = meta.Orientation,
                DurationSecond = meta.DurationSecond,
                CreatedBy = upload.CreatedBy
            };

            return await AddCreative(param);
        }

       
        private async Task<List<MvCreative>?> AddCreative(MvAddCreative param)
        {
            try
            {
                string result = await _DataAccessService.ActionProcedure(
                    "inv.SpCreativeIns", JsonConvert.SerializeObject(param));

                if (!result.TrimStart().StartsWith('['))
                {
                    var spError = JsonConvert.DeserializeObject<MvSpError>(result);
                    throw new InvalidOperationException(spError?.Message ?? "An error occurred");
                }
                return JsonConvert.DeserializeObject<List<MvCreative>>(result);
            }
            catch { throw; }
        }

      
        public async Task<GridResponse<MvCreative>?> GetGrid(
            MvParamOption<MvCreativeFilter> param)
        {
            try
            {
                string result = await _DataAccessService.RetrievalProcedure(
                    "inv.SpCreativeSel", JsonConvert.SerializeObject(param));
                return JsonConvert.DeserializeObject<GridResponse<MvCreative>>(result);
            }
            catch { throw; }
        }

      
        public async Task<List<MvDropdown>?> CreativeDdl(MvDropdown param)
        {
            try
            {
                string result = await _DataAccessService.RetrievalProcedure(
                    "Inv.SpCreativeDdl", JsonConvert.SerializeObject(param));
                return JsonConvert.DeserializeObject<List<MvDropdown>>(result);
            }
            catch { throw; }
        }

      
        public Task<List<MvCreative>?> DeleteCreative(MvDeleteCreative param)
            => throw new NotImplementedException();
    }
}