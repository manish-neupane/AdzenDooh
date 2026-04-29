using AdzenDooh.Api.Controllers.Shared.Base;
using AdzenDooh.Interface.Application.Inventory.ScreenOperatingHour;
using AdzenDooh.Model.Application.Inventory.ScreenOperatingHour;
using AdzenDooh.Model.Shared.Response;
using Microsoft.AspNetCore.Mvc;

namespace AdzenDooh.Api.Controllers.Application.Inventory.ScreenOperatingHour
{
    public class ScreenOperatingHourController(
        IScreenOperatingHourService _ScreenOperatingHourService
    ) : BaseController
    {

        [HttpGet]
        public async Task<IActionResult> GetSlot(
            [FromQuery] MvScreenOperatingHourFilter param)
        {
            try
            {
                var response = await _ScreenOperatingHourService.GetSlots(param);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }


        [HttpPost]
        public async Task<IActionResult> AddSlot(
            [FromBody] List<MvAddScreenOperatingHour> param)
        {
            try
            {
                var response = await _ScreenOperatingHourService.AddSlots(param);
                return Ok(ApiResult.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }

        
        [HttpDelete]
        public async Task<IActionResult> DeleteSlot(
            [FromBody] MvDeleteScreenOperatingHour param)
        {
            try
            {
                await _ScreenOperatingHourService.DeleteSlot(param);
                return Ok(ApiResult.Success("Slot deleted successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult.Fail<object>(ex.Message));
            }
        }
    }
}