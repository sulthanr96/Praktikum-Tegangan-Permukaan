import React, { useEffect, useState } from 'react';

/** Logo tiga batang warna SRS Lab. */
export const BrandMark: React.FC<{ size?: 'sm' | 'md'; label?: string; className?: string }> = ({
  size = 'md',
  label = 'SRS Lab',
  className = '',
}) => {
  const bar = size === 'sm' ? 'w-2.5 h-6 rounded-[5px]' : 'w-3 h-7 rounded-md';
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex gap-1" aria-hidden="true">
        <span className={`${bar} bg-spek-orange-bright`} />
        <span className={`${bar} bg-[#A78BFA]`} />
        <span className={`${bar} bg-spek-lime`} />
      </span>
      <span className={`font-heading font-bold ${size === 'sm' ? 'text-lg' : 'text-xl'}`}>{label}</span>
    </span>
  );
};

/** Jam digital + tanggal (bahasa Indonesia), diperbarui tiap detik. */
export const LiveClock: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  const date = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className={`flex flex-col items-end gap-1 ${className}`}>
      <span className="font-mono text-4xl font-bold leading-none tabular-nums">{time}</span>
      <span className="text-sm text-spek-mist">{date}</span>
    </div>
  );
};

/** Inisial untuk avatar kelompok, mis. "Kelompok 3" → "K3". */
export function groupInitials(name: string): string {
  const num = name.match(/\d+/)?.[0];
  const letter = name.trim().charAt(0).toUpperCase() || '?';
  return num ? `${letter}${num}` : name.trim().slice(0, 2).toUpperCase();
}
