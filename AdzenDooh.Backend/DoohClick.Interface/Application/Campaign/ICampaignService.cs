using AdzenDooh.Model.Application.Campaign;
using AdzenDooh.Model.Shared.Param;
using AdzenDooh.Model.Shared.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdzenDooh.Interface.Application.Campaign
{
    public interface ICampaignService
    {
        Task<GridResponse<MvCampaign>?> GetAll(MvParamOption<MvCampaignFilter> param);
        Task<MvCampaignDetail?> GetCampaignDetail(MvCampaignDetailRequest param);
        Task<GridResponse<MvCampaignCreative>?> GetCampaignCreatives(MvCampaignCreativeGridRequest param);
        Task<MvCampaign?> AddCampaign(MvCreateCampaign param);
        Task<List<MvCampaignCreative>?> AddCampaignCreative(MvSaveCampaignCreative param);
    }

}
