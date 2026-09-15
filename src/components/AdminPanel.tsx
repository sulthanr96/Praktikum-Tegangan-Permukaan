import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Trash2 } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<{username: string}[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users?adminUser=admin&adminPass=1238');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUser: 'admin',
          adminPass: '1238',
          username: newUsername.trim(),
          password: newPassword.trim(),
          newUsername: newUsername.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Peserta berhasil ditambahkan!' });
        setNewUsername('');
        setNewPassword('');
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menambahkan peserta' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan atau server tidak merespons.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Yakin ingin menghapus peserta "${username}"?`)) return;

    try {
      const response = await fetch(`/api/auth/users/${encodeURIComponent(username)}?adminUser=admin&adminPass=1238`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUser: 'admin',
          adminPass: '1238'
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Peserta "${username}" berhasil dihapus.` });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menghapus peserta' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Gagal menghubungi server saat menghapus peserta.' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#cbd5e1]/60 p-6 mb-8 mt-14 max-w-2xl mx-auto">
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-[#cbd5e1]/40">
        <div className="p-2 rounded-lg bg-[#dce9ff] text-[#003159]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#003159]">Admin: Manajemen Peserta</h2>
          <p className="font-['Inter'] text-xs text-[#64748b] mt-0.5">Tambah atau hapus akun praktikan untuk mengakses kalkulator</p>
        </div>
      </div>

      <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-3 mb-6 bg-[#f8fafc] p-4 rounded-xl border border-[#cbd5e1]/40 shadow-inner">
        <input 
          type="text" 
          placeholder="Username Peserta (misal: kelompok1)" 
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-[#cbd5e1] font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#003159]/20 focus:border-[#003159]"
          required
        />
        <input 
          type="text" 
          placeholder="Password" 
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-[#cbd5e1] font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#003159]/20 focus:border-[#003159]"
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-[#0D9488] text-white px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-sm font-bold hover:bg-[#0a7c70] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? 'Menyimpan...' : 'Tambah Peserta'}
        </button>
      </form>
      
      {message && (
        <div className={`p-3 rounded-lg text-sm mb-4 font-['Inter'] font-semibold flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-teal-50 text-teal-800 border border-teal-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="border border-[#cbd5e1]/40 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#eff4ff] border-b border-[#cbd5e1]/40 font-['JetBrains_Mono'] text-xs text-[#003159]">
            <tr>
              <th className="py-3 px-4 font-semibold">Username Peserta</th>
              <th className="py-3 px-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="font-['Inter'] text-sm divide-y divide-[#cbd5e1]/30">
            {users.length === 0 ? (
              <tr><td colSpan={2} className="py-6 text-center text-[#64748b]">Belum ada data peserta yang terdaftar</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.username} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#003159]">{u.username}</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleDeleteUser(u.username)}
                      className="text-rose-500 hover:text-rose-700 font-['JetBrains_Mono'] text-xs font-bold px-2.5 py-1 rounded-md hover:bg-rose-50 transition-all inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
