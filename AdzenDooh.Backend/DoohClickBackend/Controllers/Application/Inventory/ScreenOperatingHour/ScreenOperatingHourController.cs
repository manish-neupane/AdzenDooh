using AdzenDooh.Api.Controllers.Shared.Base;
using AdzenDooh.Interface.Application.Inventory.ScreenOperatingHour;
using AdzenDooh.Model.Application.Inventory.ScreenOperatingHour;
using AdzenDooh.Model.Shared.Response;
using Microsoft.AspNetCore.Mvc;

namespace AdzenDooh.Api.Controllers.Application.Inventory.ScreenOperatingHour
{
    public class ScreenOperatingHourController( IScreenOperatingHourService _ScreenOperatingHourService) : BaseController
    {

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] MvScreenOperatingHourFilter param)
        {
            var response = await _ScreenOperatingHourService.GetHours(param);
            return Ok(ApiResult.Success(response));
        }

        [HttpPost]
         public async Task<IActionResult> Create([FromBody] List<MvAddScreenOperatingHour> param)
        {
            var response = await _ScreenOperatingHourService.AddHours(param);
            return Ok(ApiResult.Success(response));
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromBody] MvDeleteScreenOperatingHour param)
        {
            await _ScreenOperatingHourService.DeleteHour(param);
            return Ok(ApiResult.Success("Hour deleted successfully"));
        }
    }
}