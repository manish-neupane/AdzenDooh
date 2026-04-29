using AdzenDooh.Api.Controllers.Shared.Base;
using AdzenDooh.Interface.Application.Inventory.Creative;
using AdzenDooh.Model.Application.Inventory.Creative;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AdzenDooh.Api.Controllers.Application.Inventory.Creative
{
    public class CreativeController(
        ICreativeService _CreativeService,
        IWebHostEnvironment _Env
    ) : BaseController
    {
        private readonly IWebHostEnvironment _env = _Env;  

        [HttpPost("upload")]
        [RequestSizeLimit(500_000_000)]
        [RequestFormLimits(MultipartBodyLengthLimit = 500_000_000)]
        public async Task<IActionResult> Upload(
            [FromForm] MvCreativeUpload upload,
            IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(ApiResult.Fail<object>("No file provided."));

                string wwwRoot = _env.WebRootPath
                                 ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

                var response = await _CreativeService.SaveCreative(file, upload, wwwRoot);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }


        [HttpGet]
        public async Task<IActionResult> GetGrid([FromQuery] MvParamOption<MvCreativeFilter> param)
        {
            try
            {
                var response = await _CreativeService.GetGrid(param);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }

        
    }
}