import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { AuthUser } from '../platform/api';

export interface ModuleProps {
  user: AuthUser;
  onBackToModules: () => void;
  onLogout: () => void;
}

export type ModuleTheme = 'orange' | 'violet' | 'lime';

export interface ModuleInfo {
  id: string;
  number: string;
  title: string;
  period: string;
  status: 'aktif' | 'selesai' | 'segera';
  description: string;
  chips: string[];
  theme: ModuleTheme;
  component: LazyExoticComponent<ComponentType<ModuleProps>>;
}

// Urutan di sini = urutan kartu di halaman pilih modul.
export const MODULES: ModuleInfo[] = [
  {
    id: 'inversi-gula',
    number: '02',
    title: 'Laju Inversi Gula',
    period: 'Periode 2',
    status: 'aktif',
    description: 'Hidrolisis sukrosa berkatalis asam, dipantau lewat sudut putar polarimeter untuk menentukan tetapan laju orde pertama semu.',
    chips: ['Polarimeter', 'Kinetika orde 1', 'Stopwatch terjadwal'],
    theme: 'orange',
    component: lazy(() => import('./inversiGula/InversiGulaModule')),
  },
  {
    id: 'tegangan-permukaan',
    number: '01',
    title: 'Tegangan Permukaan',
    period: 'Periode 1',
    status: 'selesai',
    description: 'Metode kenaikan kapiler relatif dan isoterm adsorpsi Gibbs untuk MgCl₂, SDS, dan deterjen.',
    chips: ['Piknometer', 'Kapiler', 'MgCl₂ · SDS · Deterjen'],
    theme: 'violet',
    component: lazy(() => import('./teganganPermukaan/TeganganPermukaanModule')),
  },
];

export function findModule(id: string | null | undefined): ModuleInfo | undefined {
  return MODULES.find((m) => m.id === id);
}
