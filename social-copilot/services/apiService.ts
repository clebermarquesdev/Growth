import { Post, PostStatus } from '../types';

const API_BASE = '/api';

export const fetchPosts = async (): Promise<Post[]> => {
  const response = await fetch(`${API_BASE}/posts`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

export const createPost = async (post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> => {
  const response = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update post status');
  }
};

export const updatePostMetrics = async (id: string, likes: number, comments: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/posts/${id}/metrics`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ likes, comments }),
  });
  if (!response.ok) {
    throw new Error('Failed to update post metrics');
  }
};

export const deletePost = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
};
