export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface GridResponse<T> {
  data: T[];
  totalCount: number;
}