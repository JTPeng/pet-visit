import { request } from './request';

export interface PostAuthor {
  id: string;
  nickname: string;
  avatar: string;
}

export interface PostItem {
  id: string;
  authorId: string;
  content: string;
  images: string[];
  petId: string | null;
  tags: string[];
  status: string;
  likeCount: number;
  commentCount: number;
  collectCount: number;
  createdAt: string;
  author: PostAuthor;
  isLiked?: boolean;
  isCollected?: boolean;
}

export interface CreatePostPayload {
  content: string;
  images: string[];
  petId?: string;
  tags?: string[];
}

export function getRecommendFeed(page = 1, pageSize = 20) {
  return request<PostItem[]>({
    url: `/post/feed/recommend?page=${page}&pageSize=${pageSize}`,
    skipAuth: true,
  });
}

export function getFollowingFeed(page = 1, pageSize = 20) {
  return request<PostItem[]>({
    url: `/post/feed/following?page=${page}&pageSize=${pageSize}`,
  });
}

export function getPostDetail(id: string) {
  return request<PostItem>({ url: `/post/${id}`, skipAuth: true });
}

export function createPost(data: CreatePostPayload) {
  return request<PostItem>({
    url: '/post',
    method: 'POST',
    data: data as unknown as Record<string, unknown>,
  });
}

export function deletePost(id: string) {
  return request<{ success: boolean }>({ url: `/post/${id}`, method: 'DELETE' });
}

export function likePost(postId: string) {
  return request<{ success: boolean }>({ url: `/post/${postId}/like`, method: 'POST' });
}

export function unlikePost(postId: string) {
  return request<{ success: boolean }>({ url: `/post/${postId}/like`, method: 'DELETE' });
}

export function collectPost(postId: string) {
  return request<{ success: boolean }>({ url: `/post/${postId}/collect`, method: 'POST' });
}

export function uncollectPost(postId: string) {
  return request<{ success: boolean }>({ url: `/post/${postId}/collect`, method: 'DELETE' });
}

export function getMyCollects(page = 1, pageSize = 20) {
  return request<{ items: PostItem[]; total: number; page: number; pageSize: number }>({
    url: `/post/collects?page=${page}&pageSize=${pageSize}`,
  });
}

export interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  likeCount: number;
  createdAt: string;
  author: PostAuthor;
  replies?: CommentItem[];
  _count?: { replies: number };
}

export function getComments(postId: string, page = 1, pageSize = 20) {
  return request<{ items: CommentItem[]; total: number; page: number; pageSize: number }>({
    url: `/post/${postId}/comments?page=${page}&pageSize=${pageSize}`,
    skipAuth: true,
  });
}

export function createComment(postId: string, data: { content: string; parentId?: string }) {
  return request<CommentItem>({
    url: `/post/${postId}/comment`,
    method: 'POST',
    data: data as unknown as Record<string, unknown>,
  });
}

export function deleteComment(commentId: string) {
  return request<{ success: boolean }>({ url: `/post/comment/${commentId}`, method: 'DELETE' });
}

export function likeComment(commentId: string) {
  return request<{ success: boolean }>({ url: `/post/comment/${commentId}/like`, method: 'POST' });
}

export function unlikeComment(commentId: string) {
  return request<{ success: boolean }>({ url: `/post/comment/${commentId}/like`, method: 'DELETE' });
}
