import axios from 'axios';
import type { Bean } from '@brobean/shared';
import { isNativeApp } from './localDatabase';
import { localBeanRepository } from './localRepositories';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export const beanRepository = {
  getBeans: async (): Promise<Bean[]> => isNativeApp()
    ? localBeanRepository.getBeans()
    : (await api.get('/beans')).data,
  getBeanById: async (id: number): Promise<Bean> => isNativeApp()
    ? localBeanRepository.getBeanById(id)
    : (await api.get(`/beans/${id}`)).data,
  createBean: async (data: Partial<Bean>): Promise<Bean> => isNativeApp()
    ? localBeanRepository.createBean(data)
    : (await api.post('/beans', data)).data,
  updateBean: async (id: number, data: Partial<Bean>): Promise<Bean> => isNativeApp()
    ? localBeanRepository.updateBean(id, data)
    : (await api.put(`/beans/${id}`, data)).data,
  archiveBean: async (id: number): Promise<Bean> => isNativeApp()
    ? localBeanRepository.archiveBean(id)
    : (await api.patch(`/beans/${id}/archive`)).data,
  restoreBean: async (id: number): Promise<Bean> => isNativeApp()
    ? localBeanRepository.restoreBean(id)
    : (await api.patch(`/beans/${id}/restore`)).data,
  deleteBean: async (id: number): Promise<void> => {
    if (isNativeApp()) return localBeanRepository.deleteBean(id);
    await api.delete(`/beans/${id}`);
  },
};
