import type { Bean } from '@brobean/shared';
import beanRepository from '../repositories/beanRepository.js';

export class BeanServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'BeanServiceError';
  }
}

function validateOptionalNumbers(bean: Partial<Bean>): void {
  if (
    bean.bagWeightGrams !== undefined &&
    (!Number.isFinite(bean.bagWeightGrams) || bean.bagWeightGrams <= 0)
  ) {
    throw new BeanServiceError(
      'Berat kopi harus berupa angka lebih dari 0.',
      400
    );
  }

  if (
    bean.price !== undefined &&
    (!Number.isFinite(bean.price) || bean.price < 0)
  ) {
    throw new BeanServiceError(
      'Harga kopi tidak boleh negatif.',
      400
    );
  }
}

function normalizeBean(bean: Partial<Bean>): Partial<Bean> {
  const normalized = { ...bean };

  const stringFields: (keyof Bean)[] = [
    'name',
    'roastery',
    'originCountry',
    'originRegion',
    'originFarm',
    'variety',
    'process',
    'roastLevel',
    'roastDate',
    'notes'
  ];

  for (const field of stringFields) {
    const value = normalized[field];

    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (field === 'name' || field === 'roastery') {
        (normalized as Record<string, unknown>)[field] = trimmed;
      } else {
        (normalized as Record<string, unknown>)[field] =
          trimmed || undefined;
      }
    }
  }

  return normalized;
}

const beanService = {
  getAll(): Bean[] {
    return beanRepository.findAll();
  },

  getById(id: number): Bean {
    const bean = beanRepository.findById(id);

    if (!bean) {
      throw new BeanServiceError('Data kopi tidak ditemukan.', 404);
    }

    return bean;
  },

  create(data: Partial<Bean>): Bean {
    const bean = normalizeBean(data);

    if (!bean.name || !bean.roastery) {
      throw new BeanServiceError(
        'Nama kopi dan roastery wajib diisi.',
        400
      );
    }

    validateOptionalNumbers(bean);

    return beanRepository.create({
      name: bean.name,
      roastery: bean.roastery,
      ...bean
    });
  },

  update(id: number, data: Partial<Bean>): Bean {
    this.getById(id);

    const bean = normalizeBean(data);

    if (bean.name !== undefined && !bean.name) {
      throw new BeanServiceError('Nama kopi tidak boleh kosong.', 400);
    }

    if (bean.roastery !== undefined && !bean.roastery) {
      throw new BeanServiceError('Roastery tidak boleh kosong.', 400);
    }

    validateOptionalNumbers(bean);

    const updated = beanRepository.update(id, bean);

    if (!updated) {
      throw new BeanServiceError('Data kopi tidak ditemukan.', 404);
    }

    return updated;
  },

    archive(id: number): Bean {
    const bean = this.getById(id);

    if (bean.archivedAt) {
      throw new BeanServiceError(
        'Kopi sudah berada di arsip.',
        409
      );
    }

    beanRepository.archive(id);

    return this.getById(id);
  },

  restore(id: number): Bean {
    const bean = this.getById(id);

    if (!bean.archivedAt) {
      throw new BeanServiceError(
        'Kopi ini tidak sedang diarsipkan.',
        409
      );
    }

    beanRepository.restore(id);

    return this.getById(id);
  },

  delete(id: number): void {
    const deleted = beanRepository.delete(id);

    if (!deleted) {
      throw new BeanServiceError('Data kopi tidak ditemukan.', 404);
    }
  }
};

export default beanService;
