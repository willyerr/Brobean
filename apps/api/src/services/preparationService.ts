import preparationRepository from '../repositories/preparationRepository.js';
import { BeanServiceError } from './beanService.js';

function slugify(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function getExisting(id: number) {
  const item = preparationRepository.findById(id);
  if (!item) throw new BeanServiceError('Metode seduh tidak ditemukan.', 404);
  return item;
}
const preparationService = {
  getAll(includeArchived = false) { return preparationRepository.findAll(includeArchived); },
  getById(id: number) { return getExisting(id); },
  create(input: { name?: unknown; note?: unknown; styleType?: unknown }) {
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (!name) throw new BeanServiceError('Nama metode seduh wajib diisi.', 400);
    if (name.length > 80) throw new BeanServiceError('Nama metode maksimal 80 karakter.', 400);
    const slug = slugify(name);
    if (!slug) throw new BeanServiceError('Nama metode tidak valid.', 400);
    const id = preparationRepository.create({ name, slug, note: typeof input.note === 'string' ? input.note.trim() : undefined, styleType: typeof input.styleType === 'string' ? input.styleType : undefined });
    return getExisting(id);
  },
  update(id: number, input: { name?: unknown; note?: unknown; styleType?: unknown }) {
    const current = getExisting(id);
    if (current.is_builtin) throw new BeanServiceError('Metode bawaan tidak dapat diubah pada tahap ini.', 403);
    const name = input.name === undefined ? undefined : typeof input.name === 'string' ? input.name.trim() : '';
    if (name !== undefined && !name) throw new BeanServiceError('Nama metode tidak boleh kosong.', 400);
    if (name && name.length > 80) throw new BeanServiceError('Nama metode maksimal 80 karakter.', 400);
    preparationRepository.update(id, { name, slug: name ? slugify(name) : undefined, note: input.note === undefined ? undefined : typeof input.note === 'string' ? input.note.trim() : null, styleType: typeof input.styleType === 'string' ? input.styleType : undefined });
    return getExisting(id);
  },
  archive(id: number) {
    const current = getExisting(id);
    if (current.is_builtin) throw new BeanServiceError('Metode bawaan tidak dapat diarsipkan.', 403);
    if (current.archived_at) throw new BeanServiceError('Metode sudah diarsipkan.', 409);
    preparationRepository.archive(id); return getExisting(id);
  },
  restore(id: number) {
    const current = getExisting(id);
    if (!current.archived_at) throw new BeanServiceError('Metode tidak sedang diarsipkan.', 409);
    preparationRepository.restore(id); return getExisting(id);
  },
  getParameters(id: number) { getExisting(id); return preparationRepository.findParameters(id); },
  updateParameters(id: number, input: unknown) {
    getExisting(id);
    if (!Array.isArray(input)) throw new BeanServiceError('Parameter harus berupa array.', 400);
    const allowedPhases = ['before', 'during', 'after'];
    const seen = new Set<string>();
    const params = input.map((raw) => {
      if (!raw || typeof raw !== 'object' || typeof raw.key !== 'string' || typeof raw.enabled !== 'boolean') throw new BeanServiceError('Format konfigurasi parameter tidak valid.', 400);
      if (seen.has(raw.key)) throw new BeanServiceError('Parameter duplikat ditemukan.', 400);
      seen.add(raw.key);
      const phase = raw.phase ?? 'before';
      if (!allowedPhases.includes(phase)) throw new BeanServiceError('Phase parameter tidak valid.', 400);
      return { key: raw.key, enabled: raw.enabled, phase, sortOrder: Number.isInteger(raw.sortOrder) ? raw.sortOrder : 0, required: raw.required === true };
    });
    const known = new Set(preparationRepository.findParameters(id).map(p => p.parameter_key));
    if (params.some(p => !known.has(p.key))) throw new BeanServiceError('Ada parameter yang tidak dikenal untuk metode ini.', 400);
    preparationRepository.updateParameters(id, params);
    return preparationRepository.findParameters(id);
  }
};
export default preparationService;
