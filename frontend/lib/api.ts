'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function initSession(userId: string, email?: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/init-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email }),
  });
  const data = await handleResponse<{ userId: string }>(res);
  return data.userId;
}

export async function getDraft(userId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/get-draft/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const body = await handleResponse<{ data: any }>(res);
  return body.data;
}

export async function saveDraft(userId: string, payload: unknown): Promise<void> {
  const res = await fetch(`${API_BASE}/api/save-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, data: payload }),
  });
  await handleResponse(res);
}
