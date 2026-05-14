// grid-config.model.ts

export interface GridColumn<T> {
  // Now 'name' must be a key of T (e.g., 'macAddress' if T is Screen)
  name: keyof T; 
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
  columns: GridColumn<T>[]; // Passed T down here
  dataSource: GridDataSource<T>;
  rows?: number;
  showActions?: boolean;
  actions?: GridAction<T>[];
}