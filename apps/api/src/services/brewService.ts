import beanRepository from '../repositories/beanRepository.js';
import preparationRepository from '../repositories/preparationRepository.js';
import brewRepository from '../repositories/brewRepository.js';
import { BeanServiceError } from './beanService.js';

function positiveId(value: unknown, label: string): number {
  const id = Number(value); if (!Number.isInteger(id) || id <= 0) throw new BeanServiceError(`${label} tidak valid.`, 400); return id;
}
function existingBrew(id: number) { const brew = brewRepository.findById(id); if (!brew) throw new BeanServiceError('Brew Log tidak ditemukan.', 404); return brew; }
function validateValues(preparationId: number, values: unknown): Record<string, unknown> {
  if (values === undefined || values === null) return {};
  if (typeof values !== 'object' || Array.isArray(values)) throw new BeanServiceError('Nilai parameter harus berupa object.', 400);
  const config = preparationRepository.findParameters(preparationId);
  const enabled = new Map(config.filter(p => p.is_enabled).map(p => [p.parameter_key, p]));
  const input = values as Record<string, unknown>;
  for (const [key, value] of Object.entries(input)) {
    const parameter = enabled.get(key);
    if (!parameter) throw new BeanServiceError(`Parameter '${key}' tidak aktif untuk metode seduh ini.`, 400);
    if (value === null || value === '') continue;
    if (parameter.value_type === 'number' || parameter.value_type === 'duration') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new BeanServiceError(`Nilai '${parameter.label}' harus berupa angka >= 0.`, 400);
    } else if (parameter.value_type === 'boolean') {
      if (typeof value !== 'boolean') throw new BeanServiceError(`Nilai '${parameter.label}' harus berupa boolean.`, 400);
    } else if (parameter.value_type === 'text_list') {
      if (!Array.isArray(value) || value.some(v => typeof v !== 'string')) throw new BeanServiceError(`Nilai '${parameter.label}' harus berupa daftar teks.`, 400);
    } else if (typeof value !== 'string') {
      throw new BeanServiceError(`Nilai '${parameter.label}' harus berupa teks.`, 400);
    }
  }
  for (const parameter of enabled.values()) {
    if (parameter.is_required && (input[parameter.parameter_key] === undefined || input[parameter.parameter_key] === null || input[parameter.parameter_key] === '')) throw new BeanServiceError(`Parameter '${parameter.label}' wajib diisi.`, 400);
  }
  return input;
}
function mapBrew(row: NonNullable<ReturnType<typeof brewRepository.findById>>) {
  const values: Record<string, unknown> = {};
  for (const item of brewRepository.findValues(row.id)) {
    try { values[item.parameter_key] = JSON.parse(item.value_json); } catch { values[item.parameter_key] = item.value_json; }
  }
  return { id: row.id, beanId: row.bean_id, preparationId: row.preparation_id, rating: row.rating, brewedAt: row.brewed_at, note: row.note ?? undefined, values, createdAt: row.created_at, updatedAt: row.updated_at };
}
const brewService = {
  getAll(filters: { beanId?: unknown; preparationId?: unknown }) {
    const beanId = filters.beanId === undefined ? undefined : positiveId(filters.beanId, 'Bean ID');
    const preparationId = filters.preparationId === undefined ? undefined : positiveId(filters.preparationId, 'Preparation ID');
    return brewRepository.findAll({ beanId, preparationId }).map(mapBrew);
  },
  getById(id: number) { return mapBrew(existingBrew(id)); },
  create(input: Record<string, unknown>) {
    const beanId = positiveId(input.beanId, 'Bean ID');
    const preparationId = positiveId(input.preparationId, 'Preparation ID');
    if (!beanRepository.findById(beanId)) throw new BeanServiceError('Bean yang dipilih tidak ditemukan.', 404);
    const preparation = preparationRepository.findById(preparationId);
    if (!preparation || preparation.archived_at) throw new BeanServiceError('Metode seduh tidak tersedia.', 400);
    if (!Number.isInteger(input.rating) || Number(input.rating) < 1 || Number(input.rating) > 5) throw new BeanServiceError('Rating wajib diisi dengan angka 1 sampai 5.', 400);
    const brewedAt = typeof input.brewedAt === 'string' && input.brewedAt.trim() ? input.brewedAt.trim() : new Date().toISOString();
    const note = input.note === undefined ? undefined : typeof input.note === 'string' ? input.note.trim() : undefined;
    const values = validateValues(preparationId, input.values);
    const id = brewRepository.create({ beanId, preparationId, rating: Number(input.rating), brewedAt, note, values });
    return this.getById(id);
  },
  update(id: number, input: Record<string, unknown>) {
    const currentBrew = existingBrew(id);
    const data: { beanId?: number; preparationId?: number; rating?: number; brewedAt?: string; note?: string | null; values?: Record<string, unknown> } = {};
    if (input.beanId !== undefined) { data.beanId = positiveId(input.beanId, 'Bean ID'); if (!beanRepository.findById(data.beanId)) throw new BeanServiceError('Bean yang dipilih tidak ditemukan.', 404); }
    if (input.preparationId !== undefined) {
      data.preparationId = positiveId(input.preparationId, 'Preparation ID');
      const preparation = preparationRepository.findById(data.preparationId);
      const isUnchangedArchivedMethod = preparation?.archived_at && data.preparationId === currentBrew.preparation_id;
      if (!preparation || (preparation.archived_at && !isUnchangedArchivedMethod)) {
        throw new BeanServiceError('Metode seduh tidak tersedia. Metode yang sudah diarsipkan hanya dapat dipertahankan pada riwayat lama.', 400);
      }
    }
    if (input.rating !== undefined) { if (!Number.isInteger(input.rating) || Number(input.rating) < 1 || Number(input.rating) > 5) throw new BeanServiceError('Rating harus berupa angka 1 sampai 5.', 400); data.rating = Number(input.rating); }
    if (input.brewedAt !== undefined) { if (typeof input.brewedAt !== 'string' || !input.brewedAt.trim()) throw new BeanServiceError('Tanggal seduh tidak valid.', 400); data.brewedAt = input.brewedAt.trim(); }
    if (input.note !== undefined) data.note = typeof input.note === 'string' ? input.note.trim() : null;
    if (input.values !== undefined) {
      const targetPreparation = data.preparationId ?? currentBrew.preparation_id;
      const isSamePreparation = targetPreparation === currentBrew.preparation_id;
      if (isSamePreparation && input.values && typeof input.values === 'object' && !Array.isArray(input.values)) {
        const configuration = preparationRepository.findParameters(targetPreparation);
        const enabledKeys = new Set(configuration.filter((parameter) => parameter.is_enabled).map((parameter) => parameter.parameter_key));
        const submittedValues = input.values as Record<string, unknown>;
        const activeSubmittedValues = Object.fromEntries(Object.entries(submittedValues).filter(([key]) => enabledKeys.has(key)));
        const preservedHistoricalValues: Record<string, unknown> = {};
        for (const item of brewRepository.findValues(id)) {
          if (enabledKeys.has(item.parameter_key)) continue;
          try { preservedHistoricalValues[item.parameter_key] = JSON.parse(item.value_json); }
          catch { preservedHistoricalValues[item.parameter_key] = item.value_json; }
        }
        data.values = { ...preservedHistoricalValues, ...validateValues(targetPreparation, activeSubmittedValues) };
      } else {
        data.values = validateValues(targetPreparation, input.values);
      }
    }
    brewRepository.update(id, data);
    return this.getById(id);
  },
  delete(id: number) { existingBrew(id); brewRepository.delete(id); }
};
export default brewService;
