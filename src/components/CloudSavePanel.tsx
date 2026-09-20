import React, { useState } from 'react';

interface CloudSavePanelProps {
  currentData: any;
  onLoadData: (data: any) => void;
  username?: string;
}

export const CloudSavePanel: React.FC<CloudSavePanelProps> = ({ currentData, onLoadData, username }) => {
  const [groupName, setGroupName] = useState(username || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    if (username) setGroupName(username);
  }, [username]);

  const API_URL = '/api/sessions';

  const handleSave = async () => {
    if (!groupName.trim()) {
      setStatus('error');
      setMessage('Masukkan nama kelompok!');
      return;
    }
    
    setStatus('loading');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: groupName.trim(),
          data: currentData
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        setStatus('success');
        setMessage('Data berhasil disimpan ke cloud!');
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Gagal menyimpan: ' + (err instanceof Error ? err.message : 'Koneksi error'));
    }
  };

  const handleLoad = async () => {
    if (!groupName.trim()) {
      setStatus('error');
      setMessage('Masukkan nama kelompok!');
      return;
    }
    
    setStatus('loading');
    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(groupName.trim())}?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const result = await response.json();
      
      if (response.ok && result.data) {
        onLoadData(result.data);
        setStatus('success');
        setMessage('Data kelompok berhasil dimuat!');
      } else {
        throw new Error(result.error || 'Data tidak ditemukan');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Gagal memuat: ' + (err instanceof Error ? err.message : 'Koneksi error'));
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
        <button onClick={() => setIsOpen(false)} className="text-[#64748b] hover:text-[#0f172a]">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-['JetBrains_Mono'] text-[#42474f] mb-1">Akun / Identitas:</label>
          {(username && username !== 'admin') ? (
            <div className="w-full px-3 py-2 bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg text-sm text-[#003159] font-['Inter'] font-semibold">
              {username}
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
              placeholder="Misal: Kelompok 3"
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
