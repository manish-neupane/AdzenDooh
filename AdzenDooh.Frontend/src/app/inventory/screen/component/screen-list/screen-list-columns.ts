// ─── screen-list-columns.ts ──────────────────────────────────────────────────
// Column definitions for the Screen List grid.
// Kept in a separate file so screen-list.component.ts stays focused on logic.

import { MvAddCreative } from '../../../../cms/creative/model/creative.model';
import { GridColumn } from '../../../../shared/model/grid-config.model';
import { MvScreen } from '../../model/screen.model';

export const screenColumns: GridColumn<MvScreen>[] = [
  { name: 'name',        columnName: 'Screen Name', type: 'text', sortable: true,  filterable: true  },
  { name: 'macAddress',  columnName: 'MAC Address', type: 'text', sortable: true,  filterable: true  },
  { name: 'location',    columnName: 'Location',    type: 'text', sortable: true,  filterable: true  },
  { name: 'status',      columnName: 'Status',      type: 'text', sortable: true,  filterable: true  },
  { name: 'resolution',  columnName: 'Resolution',  type: 'text', sortable: false, filterable: false },
  { name: 'orientation', columnName: 'Orientation', type: 'text', sortable: false, filterable: false }
];