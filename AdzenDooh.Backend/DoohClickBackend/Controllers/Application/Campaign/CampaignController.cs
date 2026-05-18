using AdzenDooh.Api.Controllers.Shared.Base;
using AdzenDooh.Interface.Application.Campaign;
using AdzenDooh.Model.Application.Campaign;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using Microsoft.AspNetCore.Mvc;

namespace AdzenDooh.Api.Controllers.Application.Campaign
{
    public class CampaignController : BaseController
    {
        private readonly ICampaignService campaignService;

        public CampaignController(ICampaignService campaignService)
        {
            this.campaignService = campaignService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] MvParamOption<MvCampaignFilter> param)
        {
            var response = await campaignService.GetAll(param);
            return Ok(ApiResult.Success(response));
        }

        [HttpGet]
        public async Task<IActionResult> GetDetail([FromQuery] MvCampaignDetailRequest param)
        {
            var response = await campaignService.GetCampaignDetail(param);
            return Ok(ApiResult.Success(response));
        }

        [HttpGet]
        public async Task<IActionResult> GetCreatives([FromQuery] MvCampaignCreativeGridRequest param)
        {
            var response = await campaignService.GetCampaignCreatives(param);
            return Ok(ApiResult.Success(response));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MvCreateCampaign param)
        {
            var response = await campaignService.AddCampaign(param);
            return Ok(ApiResult.Success(response));
        }

        [HttpPost]
        public async Task<IActionResult> AddCreative([FromBody] MvSaveCampaignCreative param)
        {
            var response = await campaignService.AddCampaignCreative(param);
            return Ok(ApiResult.Success(response));
        }
    }
}