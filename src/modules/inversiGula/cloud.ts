import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, type AuthUser } from '../../platform/api';
import { hasAnyData, normalizeState, type InversiState } from './state';

const MODULE_ID = 'inversi-gula';
const AUTOSAVE_DELAY_MS = 4000;

export type CloudStatus = 'idle' | 'saving' | 'saved' | 'loading' | 'error' | 'offline-admin';

/**
 * Sinkronisasi data modul ke server.
 * - Praktikan: tersimpan otomatis beberapa detik setelah data berubah.
 * - Saat modul dibuka dan data di perangkat masih kosong, data cloud dimuat otomatis.
 * - Aslab: tidak ada simpan otomatis (aslab bukan kelompok); bisa membuka data kelompok tertentu.
 */
export function useCloudSync(state: InversiState, setState: (s: InversiState) => void, user: AuthUser) {
  const isAdmin = user.role === 'admin';
  const [status, setStatus] = useState<CloudStatus>(isAdmin ? 'offline-admin' : 'idle');
  const [message, setMessage] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [ready, setReady] = useState(isAdmin);
  const lastSentRef = useRef<string>('');
  const stateRef = useRef(state);
  stateRef.current = state;

  const save = useCallback(async (s: InversiState) => {
    const body = JSON.stringify(s);
    setStatus('saving');
    try {
      await api(`/api/sessions/${MODULE_ID}`, { method: 'POST', body: JSON.stringify({ data: s }) });
      lastSentRef.current = body;
      setLastSaved(new Date());
      setStatus('saved');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof ApiError ? err.message : 'Gagal menyimpan ke cloud.');
    }
  }, []);

  // Muat dari cloud saat pertama dibuka, bila perangkat belum punya data
  useEffect(() => {
    if (isAdmin) return;
    let cancelled = false;
    (async () => {
      if (hasAnyData(stateRef.current)) {
        setReady(true);
        return;
      }
      setStatus('loading');
      try {
        const res = await api<{ data: any; lastUpdated: string }>(`/api/sessions/${MODULE_ID}`);
        if (!cancelled && res.data) {
          const loaded = normalizeState(res.data);
          lastSentRef.current = JSON.stringify(loaded);
          setState(loaded);
          setLastSaved(res.lastUpdated ? new Date(res.lastUpdated) : null);
          setStatus('saved');
        }
      } catch (err) {
        if (!cancelled) setStatus(err instanceof ApiError && err.status === 404 ? 'idle' : 'error');
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [isAdmin, setState]);

  // Simpan otomatis
  useEffect(() => {
    if (isAdmin || !ready) return;
    const body = JSON.stringify(state);
    if (body === lastSentRef.current || !hasAnyData(state)) return;
    const id = window.setTimeout(() => save(state), AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [state, isAdmin, ready, save]);

  const saveNow = useCallback(() => save(stateRef.current), [save]);

  /** Aslab: buka data kelompok tertentu. Praktikan: muat ulang data kelompok sendiri. */
  const loadFrom = useCallback(async (group?: string) => {
    setStatus('loading');
    try {
      const query = isAdmin && group ? `?group=${encodeURIComponent(group)}` : '';
      const res = await api<{ data: any; lastUpdated: string }>(`/api/sessions/${MODULE_ID}${query}`);
      const loaded = normalizeState(res.data);
      lastSentRef.current = JSON.stringify(loaded);
      setState(loaded);
      setLastSaved(res.lastUpdated ? new Date(res.lastUpdated) : null);
      setStatus(isAdmin ? 'offline-admin' : 'saved');
      setMessage(isAdmin ? `Data ${group} dimuat (hanya dibaca — tidak tersimpan otomatis).` : 'Data cloud dimuat.');
    } catch (err) {
      setStatus(isAdmin ? 'offline-admin' : 'error');
      setMessage(err instanceof ApiError ? err.message : 'Gagal memuat data.');
    }
  }, [isAdmin, setState]);

  return { status, message, lastSaved, saveNow, loadFrom, isAdmin };
}
