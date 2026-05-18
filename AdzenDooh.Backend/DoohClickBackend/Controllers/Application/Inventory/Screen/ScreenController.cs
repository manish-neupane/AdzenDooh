using AdzenDooh.Api.Controllers.Shared.Base;
using AdzenDooh.Interface.Application.Inventory.Screen;
using AdzenDooh.Model.Application.Inventory.Screen;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using Microsoft.AspNetCore.Mvc;

namespace AdzenDooh.Api.Controllers.Application.Inventory.Screen
{
    public class ScreenController(IScreenService screenService) : BaseController
    {
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] MvParamOption<MvScreenFilter> param)
        {
            var response = await screenService.GetGrid(param);
            return Ok(ApiResult.Success(response));
        }

        [HttpGet]
        public async Task<IActionResult> GetDetail([FromQuery] MvScreenDetailParam param)
        {
            var response = await screenService.GetDetail(param);
            return Ok(ApiResult.Success(response));
        }

        [HttpPost]
        public async Task<IActionResult> GetDdl([FromBody] MvScreenDdl param)
        {
            var response = await screenService.ScreenDdl(param);
            return Ok(ApiResult.Success(response));
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] MvUpsertScreen param)
        {
            var response = await screenService.SaveScreen(param);
            return Ok(ApiResult.Success(response));
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromBody] MvDeleteScreen param)
        {
            await screenService.DeleteScreen(param);
            return Ok(ApiResult.Success("Screen and its operating hours deleted successfully"));
        }
    }
}