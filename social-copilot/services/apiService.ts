import { Post, PostStatus, CreatorProfile } from '../types';
import { getAuthToken } from './authService';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const fetchPosts = async (): Promise<Post[]> => {
  const response = await fetch(`${API_BASE}/posts`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

export const fetchProfile = async (): Promise<CreatorProfile | null> => {
  const response = await fetch(`${API_BASE}/profile`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

export const saveProfile = async (profile: CreatorProfile): Promise<CreatorProfile> => {
  const response = await fetch(`${API_BASE}/profile`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(profile),
  });
  if (!response.ok) {
    throw new Error('Failed to save profile');
  }
  return response.json();
};

export const createPost = async (post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> => {
  const response = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(post),
  });
  if (!response.ok) {
    throw new Error('Failed to create post');
  }
  return response.json();
};

export const updatePostStatus = async (id: string, status: PostStatus): Promise<void> => {
  const response = await fetch(`${API_BASE}/posts/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update post status');
  }
};

export const updatePostMetrics = async (id: string, likes: number, comments: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/posts/${id}/metrics`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ likes, comments }),
  });
  if (!response.ok) {
    throw new Error('Failed to update post metrics');
  }
};

export const deletePost = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
};
