import { GridColumn } from '../../../../app/shared/model/grid-config.model';
import { MvCampaign } from '../../model/campaign.model';

export const campaignColumns: GridColumn<MvCampaign>[] = [
  { name: 'name',           columnName: 'Campaign Name',  type: 'text',   sortable: true,  filterable: true  },
  { name: 'durationInDays', columnName: 'Duration (days)', type: 'text',   sortable: true,  filterable: false },
  { name: 'status',         columnName: 'Status',         type: 'custom', sortable: true,  filterable: false },
  { name: 'remarks',        columnName: 'Remarks',        type: 'text',   sortable: false, filterable: false },
];