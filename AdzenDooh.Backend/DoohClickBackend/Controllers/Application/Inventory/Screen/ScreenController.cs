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
            try
            {
                var response = await screenService.GetGrid(param);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetDetail([FromQuery] MvScreenDetailParam param)
        {
            try
            {
                var response = await screenService.GetDetail(param);
                return Ok(ApiResult.Success(response));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResult.Fail<object>(ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }


        [HttpPost]
        public async Task<IActionResult> GetDdl([FromBody] MvScreenDdl param)
        {
            try
            {
                var response = await screenService.ScreenDdl(param);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> SaveScreen([FromBody] MvUpsertScreen param)
        {
            try
            {
                var response = await screenService.SaveScreen(param);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteScreen([FromBody] MvDeleteScreen param)
        {
            try
            {
                await screenService.DeleteScreen(param);
                return Ok(ApiResult.Success("Screen and its operating hours deleted successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }
    }
}