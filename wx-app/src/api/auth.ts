import { request } from './request';

interface WxLoginResponse {
  token: string;
  user: {
    id: string;
    nickname: string;
    avatar: string;
    phone: string | null;
  };
}

export function wxLogin(code: string) {
  return request<WxLoginResponse>({
    url: '/auth/wx-login',
    method: 'POST',
    data: { code },
    skipAuth: true,
  });
}

export function bindPhone(code: string) {
  return request<{ phone: string }>({
    url: '/auth/bind-phone',
    method: 'POST',
    data: { code },
  });
}
