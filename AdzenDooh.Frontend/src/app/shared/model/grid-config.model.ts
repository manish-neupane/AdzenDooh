import { ApiResponse, GridResponse } from "./sharedModel";

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
  severity: 'info' | 'warning' | 'danger';
  tooltip: string;
  handler: (row: T) => void;
}

export interface gridConfig<T> {
  columns: gridColumn[];

  dataSource: {
    data: T[];
    totalCount?: number;
  };

  rows?: number;
  showActions?: boolean;
  actions?: gridAction<T>[];
}
