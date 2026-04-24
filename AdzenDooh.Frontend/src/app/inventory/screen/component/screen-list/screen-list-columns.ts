// src/app/features/screen/components/screen-list/screen-list.columns.ts

import { gridColumn } from '../../../../shared/model/grid-config.model';

export const screenColumns: gridColumn[] = [
  { name: 'screenName',   columnName: 'Screen Name',  type: 'text'   },
  { name: 'screenType',   columnName: 'Type',         type: 'text'   },
  { name: 'placementType',columnName: 'Placement',    type: 'text'   },
  { name: 'basePrice',    columnName: 'Price',        type: 'number' },
  { name: 'status',       columnName: 'Status',       type: 'text'   },
  { name: 'resolution',   columnName: 'Resolution',   type: 'text'   },
  { name: 'orientation',  columnName: 'Orientation',  type: 'text'   },
  {name:  'macAddress',   columnName: 'MAC Address',  type: 'text' },
];