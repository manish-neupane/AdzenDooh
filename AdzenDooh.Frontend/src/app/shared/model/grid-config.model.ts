// ─── grid-config.model.ts ────────────────────────────────────────────────────
// Shared models for the reusable GridComponent.
// Nothing domain-specific lives here — screens, campaigns, etc. stay in their
// own feature folders.

export interface GridColumn {
  name: string;
  columnName: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
}

export interface GridDataSource<T> {
  data: T[];
  totalCount: number;
}

export interface GridAction<T> {
  type: 'view' | 'edit' | 'delete' | string;
  icon: string;
  severity: 'info' | 'warning' | 'danger';
  tooltip: string;
  handler: (row: T) => void;
}

export interface GridConfig<T> {
  columns: GridColumn[];
  dataSource: GridDataSource<T>;
  rows?: number;
  showActions?: boolean;
  actions?: GridAction<T>[];
}