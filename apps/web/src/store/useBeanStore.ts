import { create } from 'zustand';
import type { Bean } from '@brobean/shared';
import { beanRepository } from '../services/beanRepository';

interface BeanState {
  beans: Bean[];
  isLoading: boolean;       
  error: string | null;     
  isSubmitLoading: boolean; 
  
  fetchBeans: () => Promise<void>;
  addBean: (beanData: Partial<Bean>) => Promise<boolean>;
  editBean: (id: number, beanData: Partial<Bean>) => Promise<boolean>;
  removeBean: (id: number) => Promise<void>;
}

export const useBeanStore = create<BeanState>((set) => ({
  beans: [],
  isLoading: false,
  error: null,
  isSubmitLoading: false,

  fetchBeans: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await beanRepository.getBeans();
      set({ beans: data, isLoading: false });
    } catch (err) {
      set({ error: 'Gagal mengambil data lokal.', isLoading: false });
    }
  },

  addBean: async (beanData) => {
    set({ isSubmitLoading: true });
    try {
      const newBean = await beanRepository.createBean(beanData);
      set((state) => ({ beans: [...state.beans, newBean], isSubmitLoading: false }));
      return true;
    } catch (err) {
      set({ isSubmitLoading: false });
      return false;
    }
  },

  editBean: async (id, beanData) => {
    set({ isSubmitLoading: true });
    try {
      const updatedBean = await beanRepository.updateBean(id, beanData);
      set((state) => ({
        beans: state.beans.map(b => b.id === id ? updatedBean : b),
        isSubmitLoading: false
      }));
      return true;
    } catch (err) {
      set({ isSubmitLoading: false });
      return false;
    }
  },

  removeBean: async (id) => {
    try {
      await beanRepository.deleteBean(id);
      set((state) => ({ beans: state.beans.filter(b => b.id !== id) }));
    } catch (err) {
      alert("Gagal menghapus data");
    }
  }
}));