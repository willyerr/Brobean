import type { Bean, Brew, Preparation, PreparationParameter } from '@brobean/shared';
import { getLocalDatabase } from './localDatabase';

type Row = Record<string, unknown>;
const now = () => new Date().toISOString();
const nullable = (value: unknown) => value === null || value === undefined || value === '' ? null : value;

function mapBean(row: Row): Bean {
  return {
    id: Number(row.id), name: String(row.name), roastery: String(row.roastery),
    originCountry: (row.origin_country as string | null) ?? undefined,
    originRegion: (row.origin_region as string | null) ?? undefined,
    originFarm: (row.origin_farm as string | null) ?? undefined,
    variety: (row.variety as string | null) ?? undefined,
    process: (row.process as string | null) ?? undefined,
    roastLevel: (row.roast_level as string | null) ?? undefined,
    roastDate: (row.roast_date as string | null) ?? undefined,
    bagWeightGrams: row.bag_weight_grams == null ? undefined : Number(row.bag_weight_grams),
    price: row.price == null ? undefined : Number(row.price),
    photoBase64: (row.photo_base64 as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    archivedAt: (row.archived_at as string | null) ?? undefined,
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function normalizeBean(input: Partial<Bean>): Partial<Bean> {
  const result = { ...input };
  for (const key of ['name','roastery','originCountry','originRegion','originFarm','variety','process','roastLevel','roastDate','notes'] as const) {
    const value = result[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      (result as Record<string, unknown>)[key] = key === 'name' || key === 'roastery' ? trimmed : (trimmed || undefined);
    }
  }
  if (result.bagWeightGrams !== undefined && (!Number.isFinite(result.bagWeightGrams) || result.bagWeightGrams <= 0)) throw new Error('Berat kopi harus berupa angka lebih dari 0.');
  if (result.price !== undefined && (!Number.isFinite(result.price) || result.price < 0)) throw new Error('Harga kopi tidak boleh negatif.');
  return result;
}

export const localBeanRepository = {
  async getBeans(): Promise<Bean[]> {
    const db = await getLocalDatabase();
    const result = await db.query('SELECT * FROM beans ORDER BY id DESC');
    return (result.values ?? []).map(mapBean);
  },
  async getBeanById(id: number): Promise<Bean> {
    const db = await getLocalDatabase();
    const result = await db.query('SELECT * FROM beans WHERE id = ?', [id]);
    if (!result.values?.[0]) throw new Error('Data kopi tidak ditemukan.');
    return mapBean(result.values[0] as Row);
  },
  async createBean(input: Partial<Bean>): Promise<Bean> {
    const bean = normalizeBean(input);
    if (!bean.name || !bean.roastery) throw new Error('Nama kopi dan roastery wajib diisi.');
    const db = await getLocalDatabase();
    const result = await db.run(`INSERT INTO beans (
      name, roastery, origin_country, origin_region, origin_farm, variety, process,
      roast_level, roast_date, bag_weight_grams, price, photo_base64, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      bean.name, bean.roastery, nullable(bean.originCountry), nullable(bean.originRegion), nullable(bean.originFarm),
      nullable(bean.variety), nullable(bean.process), nullable(bean.roastLevel), nullable(bean.roastDate),
      nullable(bean.bagWeightGrams), nullable(bean.price), nullable(bean.photoBase64), nullable(bean.notes),
    ]);
    return this.getBeanById(Number(result.changes?.lastId));
  },
  async updateBean(id: number, input: Partial<Bean>): Promise<Bean> {
    const bean = normalizeBean(input);
    if (bean.name !== undefined && !bean.name) throw new Error('Nama kopi tidak boleh kosong.');
    if (bean.roastery !== undefined && !bean.roastery) throw new Error('Roastery tidak boleh kosong.');
    const columns: Record<string, keyof Bean> = {
      name:'name', roastery:'roastery', origin_country:'originCountry', origin_region:'originRegion', origin_farm:'originFarm',
      variety:'variety', process:'process', roast_level:'roastLevel', roast_date:'roastDate',
      bag_weight_grams:'bagWeightGrams', price:'price', photo_base64:'photoBase64', notes:'notes',
    };
    const fields = Object.entries(columns).filter(([, key]) => bean[key] !== undefined);
    if (fields.length) {
      const db = await getLocalDatabase();
      const setSql = fields.map(([column]) => `${column} = ?`).join(', ');
      const values = fields.map(([, key]) => nullable(bean[key]));
      await db.run(`UPDATE beans SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id]);
    }
    return this.getBeanById(id);
  },
  async archiveBean(id: number): Promise<Bean> {
    const db = await getLocalDatabase();
    await db.run('UPDATE beans SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND archived_at IS NULL', [id]);
    return this.getBeanById(id);
  },
  async restoreBean(id: number): Promise<Bean> {
    const db = await getLocalDatabase();
    await db.run('UPDATE beans SET archived_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND archived_at IS NOT NULL', [id]);
    return this.getBeanById(id);
  },
  async deleteBean(id: number): Promise<void> {
    const db = await getLocalDatabase();
    try { await db.run('DELETE FROM beans WHERE id = ?', [id]); }
    catch { throw new Error('Kopi tidak dapat dihapus karena masih digunakan pada Brew Log.'); }
  },
};

function mapPreparation(row: Row): Preparation {
  return {
    id: Number(row.id), name: String(row.name), slug: String(row.slug), note: (row.note as string | null) ?? null,
    style_type: String(row.style_type), is_builtin: Number(row.is_builtin), use_custom_parameters: Number(row.use_custom_parameters),
    archived_at: (row.archived_at as string | null) ?? null, created_at: String(row.created_at), updated_at: String(row.updated_at),
  };
}
function mapParameter(row: Row): PreparationParameter {
  return {
    parameter_key: String(row.parameter_key), label: String(row.label), value_type: row.value_type as PreparationParameter['value_type'],
    unit: (row.unit as string | null) ?? null, phase: row.phase as PreparationParameter['phase'], default_enabled: Number(row.default_enabled),
    sort_order: Number(row.sort_order), is_enabled: Number(row.is_enabled), preparation_phase: row.preparation_phase as PreparationParameter['preparation_phase'],
    preparation_sort_order: Number(row.preparation_sort_order), is_required: Number(row.is_required),
  };
}

async function getPreparationParameters(id: number): Promise<PreparationParameter[]> {
  const db = await getLocalDatabase();
  const result = await db.query(`SELECT d.*, pp.is_enabled, pp.phase AS preparation_phase,
    pp.sort_order AS preparation_sort_order, pp.is_required
    FROM preparation_parameters pp JOIN brew_parameter_definitions d ON d.parameter_key = pp.parameter_key
    WHERE pp.preparation_id = ? ORDER BY CASE pp.phase WHEN 'before' THEN 1 WHEN 'during' THEN 2 ELSE 3 END, pp.sort_order, d.label`, [id]);
  return (result.values ?? []).map((row) => mapParameter(row as Row));
}

async function getPreparation(id: number): Promise<Preparation> {
  const db = await getLocalDatabase();
  const result = await db.query('SELECT * FROM preparations WHERE id = ?', [id]);
  if (!result.values?.[0]) throw new Error('Metode seduh tidak ditemukan.');
  return mapPreparation(result.values[0] as Row);
}

function slugify(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const localPreparationRepository = {
  async getPreparations(includeArchived = false): Promise<Preparation[]> {
    const db = await getLocalDatabase();
    const result = await db.query(`SELECT * FROM preparations ${includeArchived ? '' : 'WHERE archived_at IS NULL'} ORDER BY is_builtin DESC, name COLLATE NOCASE`);
    return (result.values ?? []).map((row) => mapPreparation(row as Row));
  },
  getPreparationParameters,
  async createPreparation(input: {name: string; note?: string; styleType?: string}): Promise<Preparation> {
    const name = input.name.trim();
    if (!name || name.length > 80) throw new Error('Nama metode wajib diisi dan maksimal 80 karakter.');
    const db = await getLocalDatabase();
    const slug = slugify(name);
    const inserted = await db.run('INSERT INTO preparations (name, slug, note, style_type, is_builtin) VALUES (?, ?, ?, ?, 0)', [name, slug, nullable(input.note), input.styleType ?? 'CUSTOM_PREPARATION']);
    const id = Number(inserted.changes?.lastId);
    await db.run(`INSERT INTO preparation_parameters (preparation_id, parameter_key, is_enabled, phase, sort_order, is_required)
      SELECT ?, parameter_key, default_enabled, phase, sort_order, 0 FROM brew_parameter_definitions`, [id]);
    return getPreparation(id);
  },
  async updatePreparation(id: number, input: {name?: string; note?: string | null; styleType?: string}): Promise<Preparation> {
    const current = await getPreparation(id);
    if (current.is_builtin) throw new Error('Metode bawaan tidak dapat diubah.');
    const fields: string[] = []; const values: unknown[] = [];
    if (input.name !== undefined) { const name = input.name.trim(); if (!name || name.length > 80) throw new Error('Nama metode tidak valid.'); fields.push('name = ?', 'slug = ?'); values.push(name, slugify(name)); }
    if (input.note !== undefined) { fields.push('note = ?'); values.push(nullable(input.note)); }
    if (input.styleType !== undefined) { fields.push('style_type = ?'); values.push(input.styleType); }
    if (fields.length) { const db = await getLocalDatabase(); values.push(id); await db.run(`UPDATE preparations SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values); }
    return getPreparation(id);
  },
  async archivePreparation(id: number): Promise<Preparation> {
    const current = await getPreparation(id);
    if (current.is_builtin) throw new Error('Metode bawaan tidak dapat diarsipkan.');
    const db = await getLocalDatabase();
    await db.run('UPDATE preparations SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return getPreparation(id);
  },
  async restorePreparation(id: number): Promise<Preparation> {
    await getPreparation(id);
    const db = await getLocalDatabase();
    await db.run('UPDATE preparations SET archived_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return getPreparation(id);
  },
  async updatePreparationParameters(id: number, parameters: Array<{key: string; enabled: boolean; phase?: string; sortOrder?: number; required?: boolean}>): Promise<PreparationParameter[]> {
    await getPreparation(id);
    const db = await getLocalDatabase();
    await db.execute('BEGIN TRANSACTION');
    try {
      for (const item of parameters) await db.run(`UPDATE preparation_parameters SET is_enabled = ?, phase = ?, sort_order = ?, is_required = ? WHERE preparation_id = ? AND parameter_key = ?`, [item.enabled ? 1 : 0, item.phase ?? 'before', item.sortOrder ?? 0, item.required ? 1 : 0, id, item.key]);
      await db.execute('COMMIT');
    } catch (error) { await db.execute('ROLLBACK'); throw error; }
    return getPreparationParameters(id);
  },
};

function mapBrew(row: Row, values: Brew['values']): Brew {
  return { id: Number(row.id), beanId: Number(row.bean_id), preparationId: Number(row.preparation_id), rating: Number(row.rating),
    brewedAt: String(row.brewed_at), note: (row.note as string | null) ?? undefined, values,
    createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}
async function getBrewValues(id: number): Promise<Brew['values']> {
  const db = await getLocalDatabase();
  const result = await db.query('SELECT parameter_key, value_json FROM brew_parameter_values WHERE brew_id = ?', [id]);
  const values: Brew['values'] = {};
  for (const item of result.values ?? []) {
    try { values[String(item.parameter_key)] = JSON.parse(String(item.value_json)) as Brew['values'][string]; }
    catch { values[String(item.parameter_key)] = String(item.value_json); }
  }
  return values;
}
async function getBrew(id: number): Promise<Brew> {
  const db = await getLocalDatabase();
  const result = await db.query('SELECT * FROM brews WHERE id = ?', [id]);
  if (!result.values?.[0]) throw new Error('Brew Log tidak ditemukan.');
  return mapBrew(result.values[0] as Row, await getBrewValues(id));
}

async function validateBrewValues(preparationId: number, input: unknown): Promise<Brew['values']> {
  if (input === undefined || input === null) return {};
  if (typeof input !== 'object' || Array.isArray(input)) throw new Error('Nilai parameter harus berupa object.');
  const config = await getPreparationParameters(preparationId);
  const enabled = new Map(config.filter((p) => p.is_enabled).map((p) => [p.parameter_key, p]));
  const values = input as Record<string, unknown>;
  for (const [key, value] of Object.entries(values)) {
    const parameter = enabled.get(key);
    if (!parameter) throw new Error(`Parameter '${key}' tidak aktif untuk metode seduh ini.`);
    if (value === null || value === '') continue;
    if (parameter.value_type === 'number' || parameter.value_type === 'duration') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error(`Nilai '${parameter.label}' harus berupa angka >= 0.`);
    } else if (parameter.value_type === 'boolean') {
      if (typeof value !== 'boolean') throw new Error(`Nilai '${parameter.label}' harus berupa boolean.`);
    } else if (parameter.value_type === 'text_list') {
      if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) throw new Error(`Nilai '${parameter.label}' harus berupa daftar teks.`);
    } else if (typeof value !== 'string') throw new Error(`Nilai '${parameter.label}' harus berupa teks.`);
  }
  for (const parameter of enabled.values()) {
    if (parameter.is_required && (values[parameter.parameter_key] === undefined || values[parameter.parameter_key] === null || values[parameter.parameter_key] === '')) throw new Error(`Parameter '${parameter.label}' wajib diisi.`);
  }
  return values as Brew['values'];
}

export const localBrewRepository = {
  async getBrews(): Promise<Brew[]> {
    const db = await getLocalDatabase();
    const result = await db.query('SELECT * FROM brews ORDER BY brewed_at DESC, id DESC');
    return Promise.all((result.values ?? []).map(async (row) => mapBrew(row as Row, await getBrewValues(Number(row.id)))));
  },
  getBrewById: getBrew,
  async createBrew(input: Omit<Brew, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brew> {
    const db = await getLocalDatabase();
    const bean = await db.query('SELECT id FROM beans WHERE id = ?', [input.beanId]);
    if (!bean.values?.length) throw new Error('Bean yang dipilih tidak ditemukan.');
    const prep = await getPreparation(input.preparationId);
    if (prep.archived_at) throw new Error('Metode seduh tidak tersedia.');
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) throw new Error('Rating wajib diisi dengan angka 1 sampai 5.');
    const values = await validateBrewValues(input.preparationId, input.values);
    await db.execute('BEGIN TRANSACTION');
    try {
      const inserted = await db.run('INSERT INTO brews (bean_id, preparation_id, rating, brewed_at, note) VALUES (?, ?, ?, ?, ?)', [input.beanId, input.preparationId, input.rating, input.brewedAt || now(), nullable(input.note)]);
      const id = Number(inserted.changes?.lastId);
      for (const [key, value] of Object.entries(values)) await db.run('INSERT INTO brew_parameter_values (brew_id, parameter_key, value_json) VALUES (?, ?, ?)', [id, key, JSON.stringify(value)]);
      await db.execute('COMMIT');
      return getBrew(id);
    } catch (error) { await db.execute('ROLLBACK'); throw error; }
  },
  async updateBrew(id: number, input: Partial<Brew>): Promise<Brew> {
    const current = await getBrew(id);
    const db = await getLocalDatabase();
    const beanId = input.beanId ?? current.beanId;
    const preparationId = input.preparationId ?? current.preparationId;
    if (input.beanId !== undefined) {
      const bean = await db.query('SELECT id FROM beans WHERE id = ?', [beanId]);
      if (!bean.values?.length) throw new Error('Bean yang dipilih tidak ditemukan.');
    }
    const prep = await getPreparation(preparationId);
    if (prep.archived_at && preparationId !== current.preparationId) throw new Error('Metode seduh yang diarsipkan hanya dapat dipertahankan pada riwayat lama.');
    if (input.rating !== undefined && (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)) throw new Error('Rating harus berupa angka 1 sampai 5.');
    let valuesToSave: Brew['values'] | undefined;
    if (input.values !== undefined) {
      if (preparationId === current.preparationId && input.values && typeof input.values === 'object' && !Array.isArray(input.values)) {
        const config = await getPreparationParameters(preparationId);
        const enabledKeys = new Set(config.filter((p) => p.is_enabled).map((p) => p.parameter_key));
        const submitted = input.values as Record<string, unknown>;
        const active = Object.fromEntries(Object.entries(submitted).filter(([key]) => enabledKeys.has(key)));
        const historical = Object.fromEntries(Object.entries(current.values).filter(([key]) => !enabledKeys.has(key))) as Brew['values'];
        valuesToSave = { ...historical, ...await validateBrewValues(preparationId, active) };
      } else valuesToSave = await validateBrewValues(preparationId, input.values);
    }
    await db.execute('BEGIN TRANSACTION');
    try {
      await db.run(`UPDATE brews SET bean_id = ?, preparation_id = ?, rating = ?, brewed_at = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [beanId, preparationId, input.rating ?? current.rating, input.brewedAt ?? current.brewedAt, input.note === undefined ? nullable(current.note) : nullable(input.note), id]);
      if (valuesToSave !== undefined) {
        await db.run('DELETE FROM brew_parameter_values WHERE brew_id = ?', [id]);
        for (const [key, value] of Object.entries(valuesToSave)) await db.run('INSERT INTO brew_parameter_values (brew_id, parameter_key, value_json) VALUES (?, ?, ?)', [id, key, JSON.stringify(value)]);
      }
      await db.execute('COMMIT');
      return getBrew(id);
    } catch (error) { await db.execute('ROLLBACK'); throw error; }
  },
  async deleteBrew(id: number): Promise<void> {
    const db = await getLocalDatabase();
    await db.run('DELETE FROM brews WHERE id = ?', [id]);
  },
};
