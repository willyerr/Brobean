import axios from 'axios';
import type { Brew, Preparation, PreparationParameter } from '@brobean/shared';
import { isNativeApp } from './localDatabase';
import { localBrewRepository, localPreparationRepository } from './localRepositories';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export const brewRepository = {
  async getBrews(): Promise<Brew[]> {
    return isNativeApp() ? localBrewRepository.getBrews() : (await api.get('/brews')).data;
  },
  async getBrewById(id: number): Promise<Brew> {
    return isNativeApp() ? localBrewRepository.getBrewById(id) : (await api.get(`/brews/${id}`)).data;
  },
  async createBrew(data: Omit<Brew, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brew> {
    return isNativeApp() ? localBrewRepository.createBrew(data) : (await api.post('/brews', data)).data;
  },
  async updateBrew(id: number, data: Partial<Brew>): Promise<Brew> {
    return isNativeApp() ? localBrewRepository.updateBrew(id, data) : (await api.put(`/brews/${id}`, data)).data;
  },
  async deleteBrew(id: number): Promise<void> {
    if (isNativeApp()) return localBrewRepository.deleteBrew(id);
    await api.delete(`/brews/${id}`);
  },
  async getPreparations(includeArchived = false): Promise<Preparation[]> {
    return isNativeApp()
      ? localPreparationRepository.getPreparations(includeArchived)
      : (await api.get('/preparations', { params: includeArchived ? { includeArchived: 'true' } : undefined })).data;
  },
  async getPreparationParameters(id: number): Promise<PreparationParameter[]> {
    return isNativeApp()
      ? localPreparationRepository.getPreparationParameters(id)
      : (await api.get(`/preparations/${id}/parameters`)).data;
  },
};
