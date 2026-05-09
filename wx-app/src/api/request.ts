import { env } from '../utils/env';
import type { ApiResponse, RequestOptions } from '../types/api';

const TOKEN_STORAGE_KEY = 'pet_visit_token';

export function getToken(): string {
  return uni.getStorageSync(TOKEN_STORAGE_KEY) || '';
}

export function setToken(token: string): void {
  uni.setStorageSync(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  uni.removeStorageSync(TOKEN_STORAGE_KEY);
}

export async function request<T = unknown>(
  options: RequestOptions,
): Promise<T> {
  const token = options.skipAuth ? '' : getToken();
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.header ?? {}),
  };
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${env.apiBaseUrl}${options.url}`,
      method: options.method ?? 'GET',
      data: options.data,
      header,
      success: (res) => {
        const body = res.data as ApiResponse<T>;
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
          resolve(body.data as T);
          return;
        }
        if (res.statusCode === 401 || body.code === 40100) {
          clearToken();
        }
        uni.showToast({
          title: body.message || '请求失败',
          icon: 'none',
        });
        reject(body);
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请稍后再试', icon: 'none' });
        reject(err);
      },
    });
  });
}
