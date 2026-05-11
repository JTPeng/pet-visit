import { request } from './request';

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  bio: string | null;
  phone: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
}

export interface PublicUserProfile {
  id: string;
  nickname: string;
  avatar: string;
  bio: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
}

export function getMe() {
  return request<UserProfile>({ url: '/user/me' });
}

export function updateProfile(data: { nickname?: string; avatar?: string; bio?: string }) {
  return request<{ id: string; nickname: string; avatar: string; bio: string | null }>({
    url: '/user/me',
    method: 'PUT',
    data,
  });
}

export function getUserById(id: string) {
  return request<PublicUserProfile>({
    url: `/user/${id}`,
    skipAuth: true,
  });
}
