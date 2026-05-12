using AdzenDooh.Interface.Application.Campaign;
using AdzenDooh.Model.Application.Campaign;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using AdzenDooh.Model.Shared.SpError;
using DoohClick.DataAccess;
using Newtonsoft.Json;

namespace AdzenDooh.Service.Application.Campaign
{
    public class CampaignService(IDataAccessService _DataAccessService) : ICampaignService
    {
        public async Task<GridResponse<MvCampaign>?> GetAll(MvParamOption<MvCampaignFilter> param)
        {
            try
            {
                string result = await _DataAccessService.RetrievalProcedure("dbo.SpCampaignSel", JsonConvert.SerializeObject(param));
                return JsonConvert.DeserializeObject<GridResponse<MvCampaign>>(result);
            }
            catch (Exception) { throw; }
        }

        public async Task<MvCampaignDetail?> GetCampaignDetail(MvCampaignDetailRequest param)
        {
            try
            {
                string result = await _DataAccessService.RetrievalProcedure("dbo.SpCampaignDetailSel", JsonConvert.SerializeObject(param));
                return JsonConvert.DeserializeObject<MvCampaignDetail>(result);
            }
            catch (Exception) { throw; }
        }

        public async Task<GridResponse<MvCampaignCreative>?> GetCampaignCreatives(MvCampaignCreativeGridRequest param)
        {
            try
            {
                string result = await _DataAccessService.RetrievalProcedure("dbo.SpCampaignCreativeSel", JsonConvert.SerializeObject(param));
                return JsonConvert.DeserializeObject<GridResponse<MvCampaignCreative>>(result);
            }
            catch (Exception) { throw; }
        }

        public async Task<MvCampaign?> AddCampaign(MvCreateCampaign param)
        {
            try
            {
                string result = await _DataAccessService.ActionProcedure("dbo.SpCampaignIns", JsonConvert.SerializeObject(param));


               return JsonConvert.DeserializeObject<MvCampaign>(result);
            }
            catch (Exception) { throw; }
        }
        public async Task<List<MvCampaignCreative>?> AddCampaignCreative(MvSaveCampaignCreative param)
        {
            try
            {
                string result = await _DataAccessService.ActionProcedure("dbo.SpCampaignCreativeIns", JsonConvert.SerializeObject(param));

           
                return JsonConvert.DeserializeObject<List<MvCampaignCreative>>(result);
            }
            catch (Exception) { throw; }
        }
    }
}