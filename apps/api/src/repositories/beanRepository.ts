import type { Bean } from '@brobean/shared';
import db from '../config/database.js';

interface BeanRow {
  id: number;
  name: string;
  roastery: string;
  origin_country: string | null;
  origin_region: string | null;
  origin_farm: string | null;
  variety: string | null;
  process: string | null;
  roast_level: string | null;
  roast_date: string | null;
  bag_weight_grams: number | null;
  price: number | null;
  photo_base64: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapBean(row: BeanRow): Bean {
  return {
    id: row.id,
    name: row.name,
    roastery: row.roastery,
    originCountry: row.origin_country ?? undefined,
    originRegion: row.origin_region ?? undefined,
    originFarm: row.origin_farm ?? undefined,
    variety: row.variety ?? undefined,
    process: row.process ?? undefined,
    roastLevel: row.roast_level ?? undefined,
    roastDate: row.roast_date ?? undefined,
    bagWeightGrams: row.bag_weight_grams ?? undefined,
    price: row.price ?? undefined,
    photoBase64: row.photo_base64 ?? undefined,
    notes: row.notes ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const beanRepository = {
  findAll(): Bean[] {
    const rows = db
      .prepare('SELECT * FROM beans ORDER BY id DESC')
      .all() as BeanRow[];

    return rows.map(mapBean);
  },

  findById(id: number): Bean | null {
    const row = db
      .prepare('SELECT * FROM beans WHERE id = ?')
      .get(id) as BeanRow | undefined;

    return row ? mapBean(row) : null;
  },

  create(bean: Pick<Bean, 'name' | 'roastery'> & Partial<Bean>): Bean {
    const result = db.prepare(`
      INSERT INTO beans (
        name, roastery, origin_country, origin_region,
        origin_farm, variety, process, roast_level,
        roast_date, bag_weight_grams, price, photo_base64, notes
      ) VALUES (
        @name, @roastery, @originCountry, @originRegion,
        @originFarm, @variety, @process, @roastLevel,
        @roastDate, @bagWeightGrams, @price, @photoBase64, @notes
      )
    `).run({
      name: bean.name,
      roastery: bean.roastery,
      originCountry: bean.originCountry ?? null,
      originRegion: bean.originRegion ?? null,
      originFarm: bean.originFarm ?? null,
      variety: bean.variety ?? null,
      process: bean.process ?? null,
      roastLevel: bean.roastLevel ?? null,
      roastDate: bean.roastDate ?? null,
      bagWeightGrams: bean.bagWeightGrams ?? null,
      price: bean.price ?? null,
      photoBase64: bean.photoBase64 ?? null,
      notes: bean.notes ?? null
    });

    return this.findById(Number(result.lastInsertRowid))!;
  },

  update(id: number, bean: Partial<Bean>): Bean | null {
    const fields: Record<string, unknown> = {
      name: bean.name,
      roastery: bean.roastery,
      origin_country: bean.originCountry,
      origin_region: bean.originRegion,
      origin_farm: bean.originFarm,
      variety: bean.variety,
      process: bean.process,
      roast_level: bean.roastLevel,
      roast_date: bean.roastDate,
      bag_weight_grams: bean.bagWeightGrams,
      price: bean.price,
      photo_base64: bean.photoBase64,
      notes: bean.notes
    };

    const updates = Object.entries(fields)
      .filter(([, value]) => value !== undefined);

    if (updates.length === 0) {
      return this.findById(id);
    }

    const setClause = updates
      .map(([column]) => `${column} = @${column}`)
      .join(', ');

    const values = Object.fromEntries(
      updates.map(([column, value]) => [column, value ?? null])
    );

    db.prepare(`
      UPDATE beans
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `).run({ ...values, id });

    return this.findById(id);
  },

  archive(id: number): boolean {
    const result = db.prepare(`
      UPDATE beans
      SET archived_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND archived_at IS NULL
    `).run(id);

    return result.changes > 0;
  },

  restore(id: number): boolean {
    const result = db.prepare(`
      UPDATE beans
      SET archived_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND archived_at IS NOT NULL
    `).run(id);

    return result.changes > 0;
  },

  delete(id: number): boolean {
    const result = db
      .prepare('DELETE FROM beans WHERE id = ?')
      .run(id);

    return result.changes > 0;
  }
};

export default beanRepository;
