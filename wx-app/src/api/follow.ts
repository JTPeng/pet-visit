import { request } from './request';

interface PaginatedUsers {
  items: { id: string; nickname: string; avatar: string; followedAt: string }[];
  total: number;
  page: number;
  pageSize: number;
}

export function follow(userId: string) {
  return request<{ success: boolean }>({
    url: `/follow/${userId}`,
    method: 'POST',
  });
}

export function unfollow(userId: string) {
  return request<{ success: boolean }>({
    url: `/follow/${userId}`,
    method: 'DELETE',
  });
}

export function getFollowers(page = 1, pageSize = 20) {
  return request<PaginatedUsers>({
    url: `/follow/followers?page=${page}&pageSize=${pageSize}`,
  });
}

export function getFollowing(page = 1, pageSize = 20) {
  return request<PaginatedUsers>({
    url: `/follow/following?page=${page}&pageSize=${pageSize}`,
  });
}

export function checkIsFollowing(userId: string) {
  return request<{ isFollowing: boolean }>({
    url: `/follow/check/${userId}`,
  });
}
