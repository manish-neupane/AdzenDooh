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
        public async Task<IActionResult> ScreenGrid([FromQuery] MvParamOption<MvScreenFilter> param)
        {
            try
            {
                var response = await screenService.ScreenGrid(param);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }


        [HttpPost]
        public async Task<IActionResult> PostScreen([FromBody] MvUpsertScreen param)
        {
            try
            {
                var response = await screenService.UpsertScreen(param);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }
    }


}
