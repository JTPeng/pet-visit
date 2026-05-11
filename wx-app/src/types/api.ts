export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
  timestamp: number;
}

export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown> | unknown[];
  header?: Record<string, string>;
  skipAuth?: boolean;
}
