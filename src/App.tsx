import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { api, clearLocalData, getToken, setToken, setUnauthorizedHandler, type AuthUser } from './platform/api';
import { LoginScreen } from './platform/LoginScreen';
import { ModulePicker } from './platform/ModulePicker';
import { AdminPage } from './platform/AdminPage';
import { findModule } from './modules/registry';

// Rute sederhana berbasis hash agar refresh & tombol "kembali" browser tetap bekerja:
//   #/            → pilih modul
//   #/modul/<id>  → modul praktikum
//   #/admin       → panel aslab
type Route = { name: 'picker' } | { name: 'module'; id: string } | { name: 'admin' };

function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/');
  if (parts[0] === 'modul' && findModule(parts[1])) return { name: 'module', id: parts[1] };
  if (parts[0] === 'admin') return { name: 'admin' };
  return { name: 'picker' };
}

function navigate(path: string) {
  window.location.hash = path;
  window.scrollTo({ top: 0 });
}

const FullScreenMessage: React.FC<{ text: string }> = ({ text }) => (
  <div className="min-h-screen bg-spek-indigo text-spek-mist font-ui flex items-center justify-center text-base">{text}</div>
);

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(() => !!getToken());
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const endSession = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Token kedaluwarsa / tidak valid → kembali ke login
  useEffect(() => {
    setUnauthorizedHandler(endSession);
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  // Pulihkan sesi dari token tersimpan
  useEffect(() => {
    if (!getToken()) return;
    api<{ user: AuthUser }>('/api/auth/me')
      .then((res) => setUser(res.user))
      .catch(() => endSession())
      .finally(() => setChecking(false));
  }, [endSession]);

  const handleLogout = () => {
    if (!window.confirm('Keluar dari sesi ini? Data yang belum disimpan ke Cloud akan dihapus dari perangkat ini.')) return;
    clearLocalData();
    endSession();
    navigate('/');
  };

  if (checking) return <FullScreenMessage text="Memuat sesi…" />;

  if (!user) {
    return (
      <LoginScreen
        onLoginSuccess={(token, u) => {
          setToken(token);
          setUser(u);
          navigate('/');
        }}
      />
    );
  }

  if (route.name === 'admin' && user.role === 'admin') {
    return <AdminPage onBack={() => navigate('/')} onLogout={handleLogout} />;
  }

  if (route.name === 'module') {
    const mod = findModule(route.id)!;
    const ModuleComponent = mod.component;
    return (
      <Suspense fallback={<FullScreenMessage text={`Membuka ${mod.title}…`} />}>
        <ModuleComponent user={user} onBackToModules={() => navigate('/')} onLogout={handleLogout} />
      </Suspense>
    );
  }

  return (
    <ModulePicker
      user={user}
      onOpenModule={(id) => navigate(`/modul/${id}`)}
      onOpenAdmin={() => navigate('/admin')}
      onLogout={handleLogout}
    />
  );
}
