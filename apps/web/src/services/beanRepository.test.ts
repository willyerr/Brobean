import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { beanRepository } from './beanRepository';
import type { Bean } from '@brobean/shared';

// 1. KUNCI PERBAIKAN: Kita pastikan axios.create selalu me-return objek yang SAMA
vi.mock('axios', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockApi), // Singleton pattern untuk Mock
    },
  };
});

describe('Pengujian API dan Model Brobean', () => {
  // Ambil referensi objek bayangan yang sama dengan yang dipakai di repository
  const mockedAxios = axios.create() as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST 1: Model Valid
  it('1. Model valid: Object sesuai dengan interface Bean', () => {
    const validBean: Bean = { id: 1, name: 'Gayo', roastery: 'Kopi Kenangan' };
    expect(validBean.name).toBe('Gayo');
    expect(validBean.roastery).toBeDefined();
  });

  // TEST 2: Model Invalid
  it('2. Model invalid: Object kehilangan tipe data yang benar', () => {
    const invalidBean: any = { name: 123 }; // Tipe salah
    const isValid = (b: any) => typeof b.name === 'string' && typeof b.roastery === 'string';
    expect(isValid(invalidBean)).toBe(false);
  });

  // TEST 3: API Sukses
  it('3. API sukses: getBeans mengembalikan array data', async () => {
    const mockData = [{ id: 1, name: 'Toraja', roastery: 'Senja' }];
    mockedAxios.get.mockResolvedValueOnce({ data: mockData }); // Sekarang ini pasti nyambung!
    
    const result = await beanRepository.getBeans();
    expect(result).toEqual(mockData);
    expect(result.length).toBe(1);
  });

  // TEST 4: Data Kosong
  it('4. Data kosong: API merespons dengan array kosong', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    
    const result = await beanRepository.getBeans();
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  // TEST 5: HTTP Gagal
  it('5. HTTP gagal: getBeans melempar error saat server down', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
    
    // Perbaikan syntax expect untuk vitest
    await expect(() => beanRepository.getBeans()).rejects.toThrow('Network Error');
  });

  // TEST 6: JSON Rusak
  it('6. JSON rusak: API merespons dengan format HTML/String bukan JSON Array', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: "<html>502 Bad Gateway</html>" });
    
    const result = await beanRepository.getBeans();
    const isJsonArray = Array.isArray(result);
    expect(isJsonArray).toBe(false);
  });
});