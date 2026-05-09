import { request } from './request';

export interface HealthResponse {
  status: string;
  uptime: number;
}

export function checkHealth() {
  return request<HealthResponse>({
    url: '/health',
    method: 'GET',
    skipAuth: true,
  });
}
