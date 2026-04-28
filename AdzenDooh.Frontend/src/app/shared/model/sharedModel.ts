export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface GridResponse<T> {
  data: T[];
  totalCount: number;
}

  export interface ParamOption<T> {
  filter?: T;
  offset?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}