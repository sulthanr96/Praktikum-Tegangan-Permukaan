export interface AuthUser {
  username: string;
  displayName: string;
  members: string[];
  role: 'admin' | 'participant' | string;
}

const TOKEN_KEY = 'srslab_token';

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // penyimpanan browser tidak tersedia: sesi hanya bertahan sampai halaman ditutup
  }
}

/** Hapus seluruh data lokal SRS Lab (dipakai saat keluar dari perangkat bersama). */
export function clearLocalData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('srslab_'))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // abaikan
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** fetch ke /api dengan token otomatis; melempar ApiError bila respons gagal. */
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(path, { ...options, headers, cache: 'no-store' });
  } catch {
    throw new ApiError('Gagal menghubungi server. Periksa koneksi internet.', 0);
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // respons bukan JSON
  }

  if (!response.ok) {
    if (response.status === 401 && token && onUnauthorized) onUnauthorized();
    throw new ApiError(body?.error || `Permintaan gagal (${response.status})`, response.status);
  }
  return body as T;
}
