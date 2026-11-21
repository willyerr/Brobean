import axios from 'axios';
import type { Brew, Preparation, PreparationParameter } from '@brobean/shared';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export const brewRepository = {
  async getBrews(): Promise<Brew[]> {
    const response = await api.get('/brews');
    return response.data;
  },
  async getBrewById(id: number): Promise<Brew> {
    const response = await api.get(`/brews/${id}`);
    return response.data;
  },
  async createBrew(data: Omit<Brew, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brew> {
    const response = await api.post('/brews', data);
    return response.data;
  },
  async updateBrew(id: number, data: Partial<Brew>): Promise<Brew> {
    const response = await api.put(`/brews/${id}`, data);
    return response.data;
  },
  async deleteBrew(id: number): Promise<void> {
    await api.delete(`/brews/${id}`);
  },
  async getPreparations(): Promise<Preparation[]> {
    const response = await api.get('/preparations');
    return response.data;
  },
  async getPreparationParameters(id: number): Promise<PreparationParameter[]> {
    const response = await api.get(`/preparations/${id}/parameters`);
    return response.data;
  },
};
