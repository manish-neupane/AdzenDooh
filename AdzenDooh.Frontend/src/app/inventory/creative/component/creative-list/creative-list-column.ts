// ─── creative-list-columns.ts ────────────────────────────────────────────────
// Column definitions for the Creative/Media List grid.

import { GridColumn } from '../../../../shared/model/grid-config.model';

export const creativeColumns: GridColumn[] = [
  // This 'url' column will be used for the thumbnail/preview
  { name: 'url',         columnName: 'Preview',     type: 'custom', sortable: false, filterable: false },
  { name: 'name',        columnName: 'Media Name',  type: 'text',     sortable: true,  filterable: true  },
  { name: 'extension',   columnName: 'Format',      type: 'text',     sortable: true,  filterable: true  },
  { name: 'resolution',  columnName: 'Resolution',  type: 'text',     sortable: false, filterable: false },
  { name: 'orientation', columnName: 'Orientation', type: 'text',     sortable: true,  filterable: true  },
  { name: 'durationSecond', columnName: 'Duration', type: 'text',     sortable: true,  filterable: false },
];