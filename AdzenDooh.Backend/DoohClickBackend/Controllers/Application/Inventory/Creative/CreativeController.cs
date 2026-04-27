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
        private readonly IWebHostEnvironment _env = _Env;  // ← capture for use in methods

        // ── UPLOAD ────────────────────────────────────────────────────────────
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

                var response = await _CreativeService.UploadAndAddCreative(file, upload, wwwRoot);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }

        // ── GRID ──────────────────────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> CreativeGrid([FromQuery] MvParamOption<MvCreativeFilter> param)
        {
            try
            {
                var response = await _CreativeService.CreativeGrid(param);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }

        // ── ADD ───────────────────────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> AddCreative([FromBody] MvAddCreative param)
        {
            try
            {
                var response = await _CreativeService.AddCreative(param);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }
    }
}