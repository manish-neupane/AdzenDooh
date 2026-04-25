// src/app/features/screen/components/screen-list/screen-list.columns.ts

import { gridColumn } from '../../../../shared/model/grid-config.model';

export const screenColumns: gridColumn[] = [
  { name: 'name',         columnName: 'Screen Name',  type: 'text'   },
  { name: 'macAddress',   columnName: 'MAC Address',  type: 'text'   },
  { name: 'location',     columnName: 'Location',     type: 'text'   },
  { name: 'status',       columnName: 'Status',       type: 'text'   },
  { name: 'resolution',   columnName: 'Resolution',   type: 'text'   },
  { name: 'orientation',  columnName: 'Orientation',  type: 'text'   },
];