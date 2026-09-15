import React, { useState, useEffect } from 'react';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<{username: string}[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users?adminUser=admin&adminPass=1238');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUser: 'admin',
          adminPass: '1238',
          username: newUsername,
          password: newPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Peserta berhasil ditambahkan!');
        setNewUsername('');
        setNewPassword('');
        fetchUsers();
      } else {
        setMessage(`Gagal: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Yakin ingin menghapus peserta ${username}?`)) return;

    try {
      const response = await fetch(`/api/auth/users/${username}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUser: 'admin',
          adminPass: '1238'
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#cbd5e1]/60 p-6 mb-8 mt-14 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-[#003159]">admin_panel_settings</span>
        <h2 className="font-['Space_Grotesk'] font-bold text-xl text-[#003159]">Admin: Manajemen Peserta</h2>
      </div>

      <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-3 mb-6 bg-[#f8fafc] p-4 rounded-lg border border-[#cbd5e1]/40">
        <input 
          type="text" 
          placeholder="Username Peserta" 
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
          className="flex-1 px-3 py-2 rounded border border-[#cbd5e1] font-['Inter'] text-sm"
          required
        />
        <input 
          type="text" 
          placeholder="Password" 
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="flex-1 px-3 py-2 rounded border border-[#cbd5e1] font-['Inter'] text-sm"
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-[#0D9488] text-white px-4 py-2 rounded font-['JetBrains_Mono'] text-sm font-bold hover:bg-[#0a7c70] transition-colors"
        >
          {loading ? 'Menyimpan...' : 'Tambah User'}
        </button>
      </form>
      
      {message && <div className="text-sm text-[#0D9488] mb-4 font-semibold">{message}</div>}

      <div className="border border-[#cbd5e1]/40 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#eff4ff] border-b border-[#cbd5e1]/40 font-['JetBrains_Mono'] text-xs text-[#003159]">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Username Peserta</th>
              <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="font-['Inter'] text-sm divide-y divide-[#cbd5e1]/30">
            {users.length === 0 ? (
              <tr><td colSpan={2} className="py-4 text-center text-[#64748b]">Belum ada peserta</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.username} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold">{u.username}</td>
                  <td className="py-2.5 px-4 text-right">
                    <button 
                      onClick={() => handleDeleteUser(u.username)}
                      className="text-rose-500 hover:text-rose-700 font-['JetBrains_Mono'] text-xs font-bold"
                    >
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
