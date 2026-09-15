import React, { useState } from 'react';
import { FlaskConical, LogIn } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (role: string, username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        onLoginSuccess(data.role, username);
      } else {
        setError(data.error || 'Login gagal!');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 selection:bg-[#dce9ff] selection:text-[#003159]">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#cbd5e1]/40 w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-[#dce9ff] text-[#003159] shadow-sm flex items-center justify-center">
            <FlaskConical className="w-10 h-10 text-[#003159]" />
          </div>
          <div className="text-center">
            <h1 className="font-['Space_Grotesk'] font-bold text-2xl text-[#003159] tracking-tight">
              Kalkulator Praktikum
            </h1>
            <p className="font-['JetBrains_Mono'] text-xs text-[#64748b] mt-1">Kimia Fisik &middot; SRS Lab</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-['Inter'] text-center border border-rose-200">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <label className="font-['JetBrains_Mono'] text-xs font-semibold text-[#42474f]">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#003159]/20 focus:border-[#003159] outline-none font-['Inter'] text-sm transition-all"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-['JetBrains_Mono'] text-xs font-semibold text-[#42474f]">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:ring-2 focus:ring-[#003159]/20 focus:border-[#003159] outline-none font-['Inter'] text-sm transition-all"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#003159] text-white py-3 rounded-lg font-['JetBrains_Mono'] text-sm font-bold hover:bg-[#0e487a] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Memeriksa...' : 'Masuk ke Kalkulator'}
            {!loading && <LogIn className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
