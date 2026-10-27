import React, { useEffect, useState } from 'react';
import { api, ApiError, type AuthUser } from './api';
import { BrandMark } from './ui';
import { MODULES } from '../modules/registry';

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: AuthUser) => void;
}

interface GroupOption {
  username: string;
  displayName: string;
}

const MODULE_CHIP: Record<string, string> = {
  orange: 'bg-spek-orange',
  violet: 'bg-spek-violet',
  lime: 'bg-spek-lime text-spek-indigo',
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'kelompok' | 'aslab'>('kelompok');
  const [groups, setGroups] = useState<GroupOption[] | null>(null);
  const [groupsError, setGroupsError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ groups: GroupOption[] }>('/api/groups')
      .then((res) => setGroups(res.groups || []))
      .catch((err) => {
        setGroups([]);
        setGroupsError(err instanceof ApiError ? err.message : 'Daftar kelompok gagal dimuat.');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = mode === 'aslab' ? 'admin' : username;
    if (!user) {
      setError('Pilih kelompok terlebih dahulu.');
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ token: string; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: user, password }),
      });
      onLoginSuccess(res.token, res.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: 'kelompok' | 'aslab') => {
    setMode(next);
    setPassword('');
    setError('');
  };

  const inputClass =
    'min-h-[54px] w-full box-border px-4 rounded-2xl border-2 border-spek-violet-tint bg-spek-soft text-spek-ink font-ui text-base font-bold outline-none focus:border-spek-violet focus:bg-white transition-colors';

  return (
    <div className="min-h-screen bg-spek-indigo text-white font-ui flex flex-wrap selection:bg-spek-lime selection:text-spek-indigo">
      <section className="flex-[1_1_520px] p-6 sm:p-12 flex flex-col justify-between gap-10">
        <BrandMark />
        <div className="flex flex-col gap-5 max-w-[560px]">
          <span className="self-start px-3 py-1.5 rounded-full bg-spek-lime text-spek-indigo text-xs font-extrabold tracking-wider">
            PRAKTIKUM KIMIA FISIK
          </span>
          <h1 className="m-0 font-heading text-4xl sm:text-6xl leading-[1.02] font-extrabold tracking-tight">
            Teori, data, dan laporan dalam satu meja kerja.
          </h1>
          <p className="m-0 text-[17px] leading-relaxed text-spek-mist">
            Masuk dengan kelompokmu dan kode akses dari aslab.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {MODULES.map((m) => (
            <span key={m.id} className={`px-4 py-2.5 rounded-full text-sm font-bold ${MODULE_CHIP[m.theme]}`}>
              {m.title}
            </span>
          ))}
          <span className="px-4 py-2.5 rounded-full border-[1.5px] border-dashed border-spek-lime text-[#D9F99D] text-sm font-bold">
            Modul berikutnya
          </span>
        </div>
      </section>

      <section className="flex-[1_1_440px] p-4 sm:p-8 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[440px] bg-white text-spek-ink rounded-[28px] p-6 sm:p-9 flex flex-col gap-5 shadow-2xl"
        >
          <div className="flex flex-col gap-1.5">
            <h2 className="m-0 font-heading text-3xl font-extrabold tracking-tight">
              {mode === 'aslab' ? 'Masuk sebagai aslab' : 'Masuk'}
            </h2>
            <p className="m-0 text-[15px] text-spek-muted">
              {mode === 'aslab' ? 'Gunakan password aslab.' : 'Pilih kelompok, lalu ketik kode akses.'}
            </p>
          </div>

          {error && (
            <div role="alert" className="px-4 py-3 rounded-2xl bg-rose-50 text-rose-700 text-sm font-semibold border border-rose-200">
              {error}
            </div>
          )}

          {mode === 'kelompok' && (
            <label className="flex flex-col gap-2 text-[13px] font-bold text-[#3B3A5C]">
              Kelompok
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`${inputClass} cursor-pointer`}
                disabled={groups === null}
                required
              >
                <option value="">{groups === null ? 'Memuat daftar kelompok…' : 'Pilih kelompok…'}</option>
                {(groups || []).map((g) => (
                  <option key={g.username} value={g.username}>
                    {g.displayName}
                  </option>
                ))}
              </select>
              {groupsError && <span className="text-xs font-semibold text-rose-600">{groupsError}</span>}
              {groups && groups.length === 0 && !groupsError && (
                <span className="text-xs font-semibold text-spek-muted">Belum ada kelompok. Hubungi aslab.</span>
              )}
            </label>
          )}

          <label className="flex flex-col gap-2 text-[13px] font-bold text-[#3B3A5C]">
            {mode === 'aslab' ? 'Password aslab' : 'Kode akses'}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'aslab' ? 'current-password' : 'off'}
              className={`${inputClass} font-mono text-lg tracking-[0.2em]`}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[56px] rounded-2xl bg-spek-orange text-white font-ui text-base font-extrabold hover:bg-spek-orange-deep transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Memeriksa…' : mode === 'aslab' ? 'Masuk ke panel aslab' : 'Masuk ke praktikum'}
          </button>

          <button
            type="button"
            onClick={() => switchMode(mode === 'aslab' ? 'kelompok' : 'aslab')}
            className="self-center min-h-[44px] px-3 text-sm font-semibold text-spek-violet-deep underline underline-offset-4 hover:text-spek-violet cursor-pointer"
          >
            {mode === 'aslab' ? 'Kembali ke login kelompok' : 'Masuk sebagai aslab'}
          </button>
        </form>
      </section>
    </div>
  );
};
