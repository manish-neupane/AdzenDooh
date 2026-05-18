using AdzenDooh.Interface.Application.Campaign;
using AdzenDooh.Model.Application.Campaign;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using DoohClick.DataAccess;
using Newtonsoft.Json;

namespace AdzenDooh.Service.Application.Campaign
{
    public class CampaignService(IDataAccessService dataAccessService) : ICampaignService
    {
        public async Task<GridResponse<MvCampaign>?> GetAll(MvParamOption<MvCampaignFilter> param)
        {
            string result = await dataAccessService.RetrievalProcedure("dbo.SpCampaignSel", JsonConvert.SerializeObject(param));
            return JsonConvert.DeserializeObject<GridResponse<MvCampaign>>(result);
        }

        public async Task<MvCampaignDetail?> GetCampaignDetail(MvCampaignDetailRequest param)
        {
            string result = await dataAccessService.RetrievalProcedure("dbo.SpCampaignDetailSel", JsonConvert.SerializeObject(param));
            return JsonConvert.DeserializeObject<MvCampaignDetail>(result);
        }

        public async Task<GridResponse<MvCampaignCreative>?> GetCampaignCreatives(MvCampaignCreativeGridRequest param)
        {
            string result = await dataAccessService.RetrievalProcedure("dbo.SpCampaignCreativeSel", JsonConvert.SerializeObject(param));
            return JsonConvert.DeserializeObject<GridResponse<MvCampaignCreative>>(result);
        }

        public async Task<MvCampaign?> AddCampaign(MvCreateCampaign param)
        {
            string result = await dataAccessService.ActionProcedure("dbo.SpCampaignIns", JsonConvert.SerializeObject(param));
            return JsonConvert.DeserializeObject<MvCampaign>(result);
        }

        public async Task<List<MvCampaignCreative>?> AddCampaignCreative(MvSaveCampaignCreative param)
        {
            string result = await dataAccessService.ActionProcedure("dbo.SpCampaignCreativeIns", JsonConvert.SerializeObject(param));
            return JsonConvert.DeserializeObject<List<MvCampaignCreative>>(result);
        }
    }
}