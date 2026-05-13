const BASE_URL = '/api/admin';

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

async function request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const body = await res.json();

  if (body.code !== 0) {
    throw new Error(body.message || '请求失败');
  }
  return body.data;
}

export async function adminLogin(username: string, password: string) {
  return request<{ token: string }>(`${BASE_URL}/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getReviewPosts() {
  return request<any[]>(`${BASE_URL}/moderation/posts`);
}

export async function handleReviewPost(id: string, action: 'pass' | 'reject') {
  return request(`${BASE_URL}/moderation/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ action }),
  });
}

export async function getReports() {
  return request<any[]>(`${BASE_URL}/reports`);
}

export async function handleReport(id: number, status: 'HANDLED' | 'REJECTED') {
  return request(`${BASE_URL}/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function getSensitiveWords() {
  return request<any[]>(`${BASE_URL}/sensitive-words`);
}

export async function addSensitiveWord(word: string, category: string) {
  return request(`${BASE_URL}/sensitive-words`, {
    method: 'POST',
    body: JSON.stringify({ word, category }),
  });
}

export async function deleteSensitiveWord(id: number) {
  return request(`${BASE_URL}/sensitive-words/${id}`, { method: 'DELETE' });
}

export async function getUser(id: string) {
  return request<any>(`${BASE_URL}/users/${id}`);
}

export async function banUser(id: string, days: number) {
  return request(`${BASE_URL}/users/${id}/ban`, {
    method: 'POST',
    body: JSON.stringify({ days }),
  });
}

export async function unbanUser(id: string) {
  return request(`${BASE_URL}/users/${id}/unban`, { method: 'POST' });
}
