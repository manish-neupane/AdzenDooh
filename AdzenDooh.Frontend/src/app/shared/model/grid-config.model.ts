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