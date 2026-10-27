import React, { useEffect, useState } from 'react';
import { api, ApiError } from './api';
import { BrandMark } from './ui';

interface GroupRow {
  username: string;
  displayName: string;
  members: string[];
  order: number;
  saved: Record<string, string | null>;
}

interface AdminPageProps {
  onBack: () => void;
  onLogout: () => void;
}

const EMPTY_FORM = { username: '', displayName: '', members: '', password: '', order: '' };

function formatSaved(value: string | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Satu baris impor massal: "ID | Nama tampilan | kode akses | anggota1, anggota2" */
function parseBulkLine(line: string) {
  const [username, displayName, password, members] = line.split('|').map((s) => s.trim());
  return {
    username,
    displayName: displayName || username,
    password,
    members: (members || '').split(',').map((m) => m.trim()).filter(Boolean),
  };
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBack, onLogout }) => {
  const [groups, setGroups] = useState<GroupRow[] | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [bulk, setBulk] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadGroups = async () => {
    try {
      const res = await api<{ groups: GroupRow[] }>('/api/admin/groups');
      setGroups(res.groups || []);
    } catch (err) {
      setGroups([]);
      setMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Gagal memuat kelompok.' });
    }
  };

  useEffect(() => {
    loadGroups();
    api<{ text: string }>('/api/announcement')
      .then((res) => setAnnouncement(res.text || ''))
      .catch(() => {});
  }, []);

  const run = async (task: () => Promise<string>) => {
    setBusy(true);
    setMessage(null);
    try {
      const text = await task();
      setMessage({ type: 'success', text });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Terjadi kesalahan.' });
    } finally {
      setBusy(false);
    }
  };

  const saveGroup = (payload: { username: string; displayName: string; members: string[]; password: string; order?: number }) =>
    api<{ message: string }>('/api/admin/groups', { method: 'POST', body: JSON.stringify(payload) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const res = await saveGroup({
        username: form.username.trim(),
        displayName: form.displayName.trim(),
        members: form.members.split('\n').map((m) => m.trim()).filter(Boolean),
        password: form.password,
        order: form.order === '' ? 0 : Number(form.order),
      });
      setForm(EMPTY_FORM);
      setEditing(null);
      await loadGroups();
      return res.message;
    });
  };

  const handleBulk = () => {
    const lines = bulk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    run(async () => {
      let ok = 0;
      const failed: string[] = [];
      for (const [i, line] of lines.entries()) {
        const row = parseBulkLine(line);
        try {
          await saveGroup({ ...row, order: i + 1 });
          ok += 1;
        } catch (err) {
          failed.push(`${row.username || `baris ${i + 1}`}: ${err instanceof ApiError ? err.message : 'gagal'}`);
        }
      }
      await loadGroups();
      if (failed.length) throw new ApiError(`${ok} tersimpan, ${failed.length} gagal — ${failed.join('; ')}`, 400);
      setBulk('');
      return `${ok} kelompok tersimpan.`;
    });
  };

  const startEdit = (g: GroupRow) => {
    setEditing(g.username);
    setForm({ username: g.username, displayName: g.displayName, members: g.members.join('\n'), password: '', order: String(g.order || '') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (g: GroupRow) => {
    if (!window.confirm(`Hapus akun "${g.displayName}"? Data praktikum yang sudah tersimpan tidak ikut terhapus.`)) return;
    run(async () => {
      await api(`/api/admin/groups/${encodeURIComponent(g.username)}`, { method: 'DELETE' });
      await loadGroups();
      return `Akun "${g.displayName}" dihapus.`;
    });
  };

  const saveAnnouncement = () =>
    run(async () => {
      await api('/api/admin/announcement', { method: 'PUT', body: JSON.stringify({ text: announcement }) });
      return 'Pengumuman diperbarui.';
    });

  const field =
    'min-h-[48px] w-full box-border px-3.5 rounded-xl border-2 border-spek-violet-tint bg-spek-soft text-spek-ink font-ui text-[15px] outline-none focus:border-spek-violet focus:bg-white transition-colors';
  const label = 'flex flex-col gap-1.5 text-[13px] font-bold text-[#3B3A5C]';

  return (
    <div className="min-h-screen bg-spek-soft font-ui text-spek-ink">
      <header className="bg-spek-indigo text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <BrandMark size="sm" label="Panel Aslab" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={onBack} className="min-h-[44px] px-4 rounded-full bg-spek-indigo-2 text-sm font-semibold hover:bg-spek-indigo-3 transition-colors cursor-pointer">
              Pilih modul
            </button>
            <button type="button" onClick={onLogout} className="min-h-[44px] px-4 rounded-full border border-spek-indigo-3 text-sm font-semibold hover:bg-spek-indigo-2 transition-colors cursor-pointer">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Kelola kelompok</h1>
          <p className="m-0 text-spek-muted">Kode akses disimpan terenkripsi. Untuk mengganti kode, isi kolom kode akses saat mengedit.</p>
        </div>

        {message && (
          <div role="status" className={`px-4 py-3 rounded-2xl text-sm font-semibold border ${message.type === 'success' ? 'bg-spek-lime-tint text-spek-lime-deep border-[#BEF264]' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))]">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 flex flex-col gap-4">
            <h2 className="m-0 font-heading text-xl font-bold">{editing ? `Edit ${form.displayName || editing}` : 'Tambah kelompok'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className={label}>
                ID login
                <input className={field} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="kelompok3" disabled={!!editing} required />
              </label>
              <label className={label}>
                Nama tampilan
                <input className={field} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Kelompok 3" />
              </label>
            </div>
            <label className={label}>
              Anggota (satu nama per baris)
              <textarea className={`${field} py-3 min-h-[96px]`} value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={label}>
                {editing ? 'Kode akses baru (opsional)' : 'Kode akses'}
                <input className={`${field} font-mono`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} autoComplete="off" />
              </label>
              <label className={label}>
                Urutan
                <input className={`${field} font-mono`} type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="3" />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className="flex-1 min-h-[50px] rounded-2xl bg-spek-orange text-white font-extrabold hover:bg-spek-orange-deep transition-colors disabled:opacity-60 cursor-pointer">
                {editing ? 'Simpan perubahan' : 'Tambah kelompok'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); }} className="min-h-[50px] px-4 rounded-2xl border-2 border-spek-violet-tint text-spek-violet-deep font-bold cursor-pointer">
                  Batal
                </button>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-3xl p-6 flex flex-col gap-3">
              <h2 className="m-0 font-heading text-xl font-bold">Impor banyak kelompok</h2>
              <p className="m-0 text-sm text-spek-muted">
                Satu kelompok per baris: <span className="font-mono text-xs bg-spek-soft px-1.5 py-0.5 rounded">ID | Nama | kode | anggota1, anggota2</span>
              </p>
              <textarea
                className={`${field} py-3 min-h-[110px] font-mono text-sm`}
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                placeholder={'kelompok1 | Kelompok 1 | kode1 | Nama A, Nama B\nkelompok2 | Kelompok 2 | kode2 | Nama C, Nama D'}
              />
              <button type="button" onClick={handleBulk} disabled={busy || !bulk.trim()} className="min-h-[48px] rounded-2xl bg-spek-violet text-white font-extrabold hover:bg-spek-violet-deep transition-colors disabled:opacity-50 cursor-pointer">
                Impor
              </button>
            </section>

            <section className="bg-white rounded-3xl p-6 flex flex-col gap-3">
              <h2 className="m-0 font-heading text-xl font-bold">Pengumuman aslab</h2>
              <textarea className={`${field} py-3 min-h-[90px]`} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} maxLength={1000} placeholder="Mis. Praktikum kelompok 1–4 dimulai pukul 08.00." />
              <button type="button" onClick={saveAnnouncement} disabled={busy} className="min-h-[48px] rounded-2xl bg-spek-lime-deep text-white font-extrabold hover:bg-[#365314] transition-colors disabled:opacity-50 cursor-pointer">
                Simpan pengumuman
              </button>
            </section>
          </div>
        </div>

        <section className="bg-white rounded-3xl p-4 sm:p-6 flex flex-col gap-3">
          <h2 className="m-0 font-heading text-xl font-bold">Daftar kelompok ({groups?.length ?? '…'})</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-white">
                  <th className="bg-spek-indigo px-3 py-3 rounded-l-xl whitespace-nowrap">Kelompok</th>
                  <th className="bg-spek-indigo px-3 py-3">Anggota</th>
                  <th className="bg-spek-indigo px-3 py-3 whitespace-nowrap">Simpan: Tegangan</th>
                  <th className="bg-spek-indigo px-3 py-3 whitespace-nowrap">Simpan: Inversi</th>
                  <th className="bg-spek-indigo px-3 py-3 rounded-r-xl text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {groups === null && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-spek-muted">Memuat…</td></tr>
                )}
                {groups?.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-spek-muted">Belum ada kelompok.</td></tr>
                )}
                {groups?.map((g) => (
                  <tr key={g.username} className="align-top">
                    <td className="px-3 py-3 border-b border-spek-violet-tint">
                      <div className="font-bold">{g.displayName}</div>
                      <div className="font-mono text-xs text-spek-muted">{g.username}</div>
                    </td>
                    <td className="px-3 py-3 border-b border-spek-violet-tint text-spek-muted">{g.members.join(', ') || '—'}</td>
                    <td className="px-3 py-3 border-b border-spek-violet-tint font-mono text-xs whitespace-nowrap">{formatSaved(g.saved['tegangan-permukaan'])}</td>
                    <td className="px-3 py-3 border-b border-spek-violet-tint font-mono text-xs whitespace-nowrap">{formatSaved(g.saved['inversi-gula'])}</td>
                    <td className="px-3 py-3 border-b border-spek-violet-tint text-right whitespace-nowrap">
                      <button type="button" onClick={() => startEdit(g)} className="min-h-[40px] px-3 rounded-lg text-spek-violet-deep font-bold hover:bg-spek-violet-tint cursor-pointer">Edit</button>
                      <button type="button" onClick={() => handleDelete(g)} className="min-h-[40px] px-3 rounded-lg text-rose-600 font-bold hover:bg-rose-50 cursor-pointer">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
