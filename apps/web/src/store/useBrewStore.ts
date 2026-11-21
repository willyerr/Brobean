import { create } from 'zustand';
import type { Brew } from '@brobean/shared';
import { brewRepository } from '../services/brewRepository';

interface BrewState {
  brews: Brew[];
  isLoading: boolean;
  error: string | null;
  fetchBrews: () => Promise<void>;
  addBrew: (data: Omit<Brew, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Brew | null>;
  editBrew: (id: number, data: Partial<Brew>) => Promise<Brew | null>;
  removeBrew: (id: number) => Promise<boolean>;
}

export const useBrewStore = create<BrewState>((set) => ({
  brews: [],
  isLoading: false,
  error: null,
  fetchBrews: async () => {
    set({ isLoading: true, error: null });
    try {
      const brews = await brewRepository.getBrews();
      set({ brews, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Brew Log belum dapat dimuat. Periksa apakah API sedang berjalan.' });
    }
  },
  addBrew: async (data) => {
    try {
      const created = await brewRepository.createBrew(data);
      set((state) => ({ brews: [created, ...state.brews], error: null }));
      return created;
    } catch {
      set({ error: 'Brew Log gagal disimpan. Periksa kembali data dan koneksi API.' });
      return null;
    }
  },
  editBrew: async (id, data) => {
    try {
      const updated = await brewRepository.updateBrew(id, data);
      set((state) => ({ brews: state.brews.map((brew) => brew.id === id ? updated : brew), error: null }));
      return updated;
    } catch {
      set({ error: 'Perubahan Brew Log gagal disimpan.' });
      return null;
    }
  },
  removeBrew: async (id) => {
    try {
      await brewRepository.deleteBrew(id);
      set((state) => ({ brews: state.brews.filter((brew) => brew.id !== id), error: null }));
      return true;
    } catch {
      set({ error: 'Brew Log gagal dihapus.' });
      return false;
    }
  },
}));
