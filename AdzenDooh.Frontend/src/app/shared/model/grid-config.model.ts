export interface gridColumn {
  name:        string;
  columnName:  string;
  type:        string;
  sortable?:   boolean;
  filterable?: boolean;
}

export interface gridDataSource<T> {
  data: T[];
}

// export interface gridConfig<T> {
//   columns:    gridColumn[];
//   dataSource: gridDataSource<T>;
//   rows?:      number;
// }

export interface gridAction<T> {
  type: 'view' | 'edit' | 'delete' | string;
  icon: string;
  severity: 'info' | 'warn' | 'danger';
  tooltip: string;
  handler: (row: T) => void;
}

export interface gridConfig<T> {
  columns:    gridColumn[];
  dataSource: gridDataSource<T>;
  rows?:      number;
  showActions?: boolean;       //  controls whether actions column appears
  actions?: gridAction<T>[];   // defines which actions to show
}
