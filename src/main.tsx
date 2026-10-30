import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Setelah deploy baru, file modul lama tidak tersedia lagi. Bila halaman yang sudah terbuka
// gagal memuat modul, muat ulang sekali (data aman tersimpan di browser & cloud).
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const key = 'srslab_reloaded_at';
  const last = Number(sessionStorage.getItem(key) || 0);
  if (Date.now() - last > 10000) {
    sessionStorage.setItem(key, String(Date.now()));
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
