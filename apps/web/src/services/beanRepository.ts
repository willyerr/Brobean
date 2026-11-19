import axios from 'axios';
import type { Bean } from '@brobean/shared';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export const beanRepository = {
  // READ
  getBeans: async (): Promise<Bean[]> => {
    await new Promise(res => setTimeout(res, 800));
    const response = await api.get('/beans');
    return response.data;
  },

  // CREATE
  createBean: async (data: Partial<Bean>): Promise<Bean> => {
    await new Promise(res => setTimeout(res, 800));
    const response = await api.post('/beans', data);
    return response.data;
  },

  // UPDATE
  updateBean: async (id: number, data: Partial<Bean>): Promise<Bean> => {
    await new Promise(res => setTimeout(res, 800));
    const response = await api.put(`/beans/${id}`, data);
    return response.data;
  },

  // ARCHIVE
  archiveBean: async (id: number): Promise<Bean> => {
    const response = await api.patch(`/beans/${id}/archive`);
    return response.data;
  },

  // RESTORE
  restoreBean: async (id: number): Promise<Bean> => {
    const response = await api.patch(`/beans/${id}/restore`);
    return response.data;
  },

  // DELETE
  deleteBean: async (id: number): Promise<void> => {
    await new Promise(res => setTimeout(res, 800));
    await api.delete(`/beans/${id}`);
  }
};
