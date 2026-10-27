import React, { useState } from 'react';
import { api, ApiError, type AuthUser } from '../platform/api';

interface CloudSavePanelProps {
  moduleId: string;
  user: AuthUser;
  currentData: any;
  onLoadData: (data: any) => void;
}

export const CloudSavePanel: React.FC<CloudSavePanelProps> = ({ moduleId, user, currentData, onLoadData }) => {
  const isAdmin = user.role === 'admin';
  // Praktikan selalu memakai kelompoknya sendiri; aslab bisa membuka data kelompok mana pun
  const [groupName, setGroupName] = useState(isAdmin ? '' : user.username);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const API_URL = `/api/sessions/${moduleId}`;
  const target = groupName.trim();

  const fail = (prefix: string, err: unknown) => {
    setStatus('error');
    setMessage(`${prefix}: ${err instanceof ApiError ? err.message : 'Koneksi error'}`);
  };

  const handleSave = async () => {
    if (!target) {
      setStatus('error');
      setMessage('Masukkan nama kelompok!');
      return;
    }
    setStatus('loading');
    try {
      await api(API_URL, {
        method: 'POST',
        body: JSON.stringify({ group: target, data: currentData }),
      });
      setStatus('success');
      setMessage('Data berhasil disimpan ke cloud!');
    } catch (err) {
      fail('Gagal menyimpan', err);
    }
  };

  const handleLoad = async () => {
    if (!target) {
      setStatus('error');
      setMessage('Masukkan nama kelompok!');
      return;
    }
    setStatus('loading');
    try {
      const query = isAdmin ? `?group=${encodeURIComponent(target)}` : '';
      const result = await api<{ data: any }>(`${API_URL}${query}`);
      onLoadData(result.data);
      setStatus('success');
      setMessage('Data kelompok berhasil dimuat!');
    } catch (err) {
      fail('Gagal memuat', err);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-24 left-6 z-50 bg-[#00687a] text-white p-3 sm:px-4 sm:py-2.5 rounded-full shadow-lg hover:bg-[#005260] transition-all flex items-center justify-center gap-2 font-['JetBrains_Mono'] text-sm font-semibold print:hidden"
      >
        <span className="material-symbols-outlined text-[20px] sm:text-[18px]">cloud_sync</span>
        <span className="hidden sm:inline">Cloud Sync</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-6 z-50 bg-white rounded-xl shadow-2xl border border-[#cbd5e1] p-5 w-72 sm:w-80 print:hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Space_Grotesk'] font-bold text-[#003159] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00687a]">cloud_sync</span>
          Cloud Database
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-[#64748b] hover:text-[#0f172a]" aria-label="Tutup">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-['JetBrains_Mono'] text-[#42474f] mb-1">
            {isAdmin ? 'ID kelompok yang dibuka:' : 'Akun / Identitas:'}
          </label>
          {!isAdmin ? (
            <div className="w-full px-3 py-2 bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg text-sm text-[#003159] font-['Inter'] font-semibold">
              {user.displayName}
            </div>
          ) : (
            <input
              type="text"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setStatus('idle');
                setMessage('');
              }}
              placeholder="Misal: kelompok3"
              className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-sm focus:outline-none focus:border-[#003159] focus:ring-1 focus:ring-[#003159] transition-all font-['Inter']"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleLoad}
            disabled={status === 'loading'}
            className="px-3 py-2 bg-[#eff4ff] text-[#003159] font-['JetBrains_Mono'] text-xs font-bold rounded-md hover:bg-[#dce9ff] transition-colors border border-[#003159]/10 disabled:opacity-50"
          >
            Load Data
          </button>
          <button
            onClick={handleSave}
            disabled={status === 'loading'}
            className="px-3 py-2 bg-[#00687a] text-white font-['JetBrains_Mono'] text-xs font-bold rounded-md hover:bg-[#005260] transition-colors disabled:opacity-50"
          >
            Save Data
          </button>
        </div>

        {status !== 'idle' && (
          <div className={`text-xs font-['Inter'] p-2 rounded-md ${
            status === 'loading' ? 'bg-slate-100 text-slate-600' :
            status === 'success' ? 'bg-emerald-50 text-emerald-600' :
            'bg-rose-50 text-rose-600'
          }`}>
            {status === 'loading' ? 'Memproses...' : message}
          </div>
        )}
      </div>
    </div>
  );
};
