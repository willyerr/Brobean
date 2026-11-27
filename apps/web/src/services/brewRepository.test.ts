
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { brewRepository } from './brewRepository';

const {
  mockApi,
  mockIsNativeApp,
  mockLocalBrewRepository,
  mockLocalPreparationRepository,
} = vi.hoisted(() => ({
  mockApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  mockIsNativeApp: vi.fn(),
  mockLocalBrewRepository: {
    getBrews: vi.fn(),
    getBrewById: vi.fn(),
    createBrew: vi.fn(),
    updateBrew: vi.fn(),
    deleteBrew: vi.fn(),
  },
  mockLocalPreparationRepository: {
    getPreparations: vi.fn(),
    getPreparationParameters: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApi),
  },
}));

vi.mock('./localDatabase', () => ({
  isNativeApp: mockIsNativeApp,
}));

vi.mock('./localRepositories', () => ({
  localBrewRepository: mockLocalBrewRepository,
  localPreparationRepository: mockLocalPreparationRepository,
}));

describe('brewRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsNativeApp.mockReturnValue(false);
  });

  describe('Web API', () => {
    it('mengambil seluruh Brew dari API', async () => {
      const data = [{ id: 1, rating: 5 }];
      mockApi.get.mockResolvedValue({ data });

      await expect(brewRepository.getBrews()).resolves.toEqual(data);
      expect(mockApi.get).toHaveBeenCalledWith('/brews');
    });

    it('mengambil Brew berdasarkan ID dari API', async () => {
      const data = { id: 10, rating: 4 };
      mockApi.get.mockResolvedValue({ data });

      await expect(brewRepository.getBrewById(10)).resolves.toEqual(data);
      expect(mockApi.get).toHaveBeenCalledWith('/brews/10');
    });

    it('membuat Brew melalui API', async () => {
      const input = { beanId: 1, preparationId: 1, rating: 5 };
      const data = { id: 20, ...input };
      mockApi.post.mockResolvedValue({ data });

      await expect(
        brewRepository.createBrew(input as never)
      ).resolves.toEqual(data);

      expect(mockApi.post).toHaveBeenCalledWith('/brews', input);
    });

    it('memperbarui Brew melalui API', async () => {
      const input = { rating: 4 };
      const data = { id: 10, rating: 4 };
      mockApi.put.mockResolvedValue({ data });

      await expect(
        brewRepository.updateBrew(10, input)
      ).resolves.toEqual(data);

      expect(mockApi.put).toHaveBeenCalledWith('/brews/10', input);
    });

    it('menghapus Brew melalui API', async () => {
      mockApi.delete.mockResolvedValue({});

      await expect(
        brewRepository.deleteBrew(10)
      ).resolves.toBeUndefined();

      expect(mockApi.delete).toHaveBeenCalledWith('/brews/10');
    });

    it('mengambil daftar preparation tanpa parameter archived secara default', async () => {
      const data = [{ id: 1, name: 'V60' }];
      mockApi.get.mockResolvedValue({ data });

      await expect(
        brewRepository.getPreparations()
      ).resolves.toEqual(data);

      expect(mockApi.get).toHaveBeenCalledWith('/preparations', {
        params: undefined,
      });
    });

    it('mengambil preparation termasuk yang archived', async () => {
      const data = [{ id: 1, name: 'V60' }];
      mockApi.get.mockResolvedValue({ data });

      await expect(
        brewRepository.getPreparations(true)
      ).resolves.toEqual(data);

      expect(mockApi.get).toHaveBeenCalledWith('/preparations', {
        params: { includeArchived: 'true' },
      });
    });

    it('mengambil parameter preparation berdasarkan ID', async () => {
      const data = [{ key: 'grind_weight', type: 'number' }];
      mockApi.get.mockResolvedValue({ data });

      await expect(
        brewRepository.getPreparationParameters(5)
      ).resolves.toEqual(data);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/preparations/5/parameters'
      );
    });

    it('meneruskan error ketika API gagal mengambil Brew', async () => {
      mockApi.get.mockRejectedValue(new Error('Network Error'));

      await expect(brewRepository.getBrews()).rejects.toThrow(
        'Network Error'
      );
    });

    it('meneruskan error ketika API gagal membuat Brew', async () => {
      mockApi.post.mockRejectedValue(new Error('Server Error'));

      await expect(
        brewRepository.createBrew({} as never)
      ).rejects.toThrow('Server Error');
    });
  });

  describe('Native Android', () => {
    beforeEach(() => {
      mockIsNativeApp.mockReturnValue(true);
    });

    it('mengambil seluruh Brew dari local repository', async () => {
      const data = [{ id: 1 }];
      mockLocalBrewRepository.getBrews.mockResolvedValue(data);

      await expect(brewRepository.getBrews()).resolves.toEqual(data);
      expect(mockLocalBrewRepository.getBrews).toHaveBeenCalled();
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('mengambil Brew berdasarkan ID dari local repository', async () => {
      const data = { id: 10 };
      mockLocalBrewRepository.getBrewById.mockResolvedValue(data);

      await expect(
        brewRepository.getBrewById(10)
      ).resolves.toEqual(data);

      expect(
        mockLocalBrewRepository.getBrewById
      ).toHaveBeenCalledWith(10);
    });

    it('membuat Brew melalui local repository', async () => {
      const input = { beanId: 1, rating: 5 };
      const data = { id: 20, ...input };
      mockLocalBrewRepository.createBrew.mockResolvedValue(data);

      await expect(
        brewRepository.createBrew(input as never)
      ).resolves.toEqual(data);

      expect(
        mockLocalBrewRepository.createBrew
      ).toHaveBeenCalledWith(input);
    });

    it('memperbarui Brew melalui local repository', async () => {
      const input = { rating: 4 };
      const data = { id: 10, rating: 4 };
      mockLocalBrewRepository.updateBrew.mockResolvedValue(data);

      await expect(
        brewRepository.updateBrew(10, input)
      ).resolves.toEqual(data);

      expect(
        mockLocalBrewRepository.updateBrew
      ).toHaveBeenCalledWith(10, input);
    });

    it('menghapus Brew melalui local repository', async () => {
      mockLocalBrewRepository.deleteBrew.mockResolvedValue(undefined);

      await expect(
        brewRepository.deleteBrew(10)
      ).resolves.toBeUndefined();

      expect(
        mockLocalBrewRepository.deleteBrew
      ).toHaveBeenCalledWith(10);

      expect(mockApi.delete).not.toHaveBeenCalled();
    });

    it('mengambil preparation dari local repository', async () => {
      const data = [{ id: 1, name: 'V60' }];
      mockLocalPreparationRepository.getPreparations.mockResolvedValue(data);

      await expect(
        brewRepository.getPreparations(true)
      ).resolves.toEqual(data);

      expect(
        mockLocalPreparationRepository.getPreparations
      ).toHaveBeenCalledWith(true);
    });

    it('mengambil parameter preparation dari local repository', async () => {
      const data = [{ key: 'grind_weight' }];
      mockLocalPreparationRepository.getPreparationParameters.mockResolvedValue(data);

      await expect(
        brewRepository.getPreparationParameters(5)
      ).resolves.toEqual(data);

      expect(
        mockLocalPreparationRepository.getPreparationParameters
      ).toHaveBeenCalledWith(5);
    });

    it('meneruskan error dari local repository', async () => {
      mockLocalBrewRepository.getBrews.mockRejectedValue(
        new Error('Local Database Error')
      );

      await expect(brewRepository.getBrews()).rejects.toThrow(
        'Local Database Error'
      );
    });
  });
});
