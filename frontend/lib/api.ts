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

export async function generatePdf(payload: unknown): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/generate-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  });
  
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  
  return res.blob();
}

/**
 * Generate Form E (Law School Certificate) for a specific law school
 */
export async function generateFormE(payload: unknown, lawSchoolIndex: number = 0): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/generate-form-e`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload, lawSchoolIndex }),
  });
  
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  
  return res.blob();
}

/**
 * Generate all Form E PDFs (one per law school)
 */
export async function generateAllFormE(payload: unknown): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/generate-all-form-e`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  });
  
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  
  return res.blob();
}

/**
 * Generate Form C (Good Moral Character) for a specific affirmant
 */
export async function generateFormC(payload: unknown, affirmantIndex: number = 0): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/generate-form-c`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload, affirmantIndex }),
  });
  
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  
  return res.blob();
}

/**
 * Generate Form D (Employment Affirmation) for a specific employment
 */
export async function generateFormD(payload: unknown, affirmantIndex: number = 0): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/generate-form-d`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload, affirmantIndex }),
  });
  
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  
  return res.blob();
}

/**
 * Generate Form H (Skills Competency and Professional Values)
 */
export async function generateFormH(payload: unknown): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/generate-form-h`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  });
  
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  
  return res.blob();
}

/**
 * Generate Form F (Pro Bono 50-Hour Affidavit) for a specific placement
 */
export async function generateFormF(payload: unknown, entryIndex: number = 0): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/generate-form-f`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload, entryIndex }),
  });
  
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  
  return res.blob();
}

/**
 * Generate Form G (Pro Bono Scholars Program Completion)
 */
export async function generateFormG(payload: unknown): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/generate-form-g`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  });
  
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  
  return res.blob();
}
