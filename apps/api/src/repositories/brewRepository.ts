import db from '../config/database.js';
export interface BrewRow {
  id: number; bean_id: number; preparation_id: number; rating: number;
  brewed_at: string; note: string | null; created_at: string; updated_at: string;
}
export interface BrewValueRow { parameter_key: string; value_json: string; }
const brewRepository = {
  findAll(filters: { beanId?: number; preparationId?: number } = {}): BrewRow[] {
    const clauses: string[] = []; const values: number[] = [];
    if (filters.beanId !== undefined) { clauses.push('bean_id = ?'); values.push(filters.beanId); }
    if (filters.preparationId !== undefined) { clauses.push('preparation_id = ?'); values.push(filters.preparationId); }
    return db.prepare(`SELECT * FROM brews ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''} ORDER BY brewed_at DESC, id DESC`).all(...values) as BrewRow[];
  },
  findById(id: number): BrewRow | undefined { return db.prepare('SELECT * FROM brews WHERE id = ?').get(id) as BrewRow | undefined; },
  findValues(id: number): BrewValueRow[] { return db.prepare('SELECT parameter_key, value_json FROM brew_parameter_values WHERE brew_id = ? ORDER BY parameter_key').all(id) as BrewValueRow[]; },
  create(data: { beanId: number; preparationId: number; rating: number; brewedAt: string; note?: string; values: Record<string, unknown> }): number {
    const insertBrew = db.prepare(`INSERT INTO brews (bean_id, preparation_id, rating, brewed_at, note) VALUES (?, ?, ?, ?, ?)`);
    const insertValue = db.prepare('INSERT INTO brew_parameter_values (brew_id, parameter_key, value_json) VALUES (?, ?, ?)');
    const tx = db.transaction(() => {
      const result = insertBrew.run(data.beanId, data.preparationId, data.rating, data.brewedAt, data.note ?? null);
      const id = Number(result.lastInsertRowid);
      for (const [key, value] of Object.entries(data.values)) insertValue.run(id, key, JSON.stringify(value));
      return id;
    });
    return tx();
  },
  update(id: number, data: { beanId?: number; preparationId?: number; rating?: number; brewedAt?: string; note?: string | null; values?: Record<string, unknown> }): void {
    const tx = db.transaction(() => {
      const fields: string[] = []; const args: unknown[] = [];
      if (data.beanId !== undefined) { fields.push('bean_id = ?'); args.push(data.beanId); }
      if (data.preparationId !== undefined) { fields.push('preparation_id = ?'); args.push(data.preparationId); }
      if (data.rating !== undefined) { fields.push('rating = ?'); args.push(data.rating); }
      if (data.brewedAt !== undefined) { fields.push('brewed_at = ?'); args.push(data.brewedAt); }
      if (data.note !== undefined) { fields.push('note = ?'); args.push(data.note); }
      if (fields.length) { fields.push('updated_at = CURRENT_TIMESTAMP'); args.push(id); db.prepare(`UPDATE brews SET ${fields.join(', ')} WHERE id = ?`).run(...args); }
      if (data.values !== undefined) {
        db.prepare('DELETE FROM brew_parameter_values WHERE brew_id = ?').run(id);
        const insert = db.prepare('INSERT INTO brew_parameter_values (brew_id, parameter_key, value_json) VALUES (?, ?, ?)');
        for (const [key, value] of Object.entries(data.values)) insert.run(id, key, JSON.stringify(value));
      }
    });
    tx();
  },
  delete(id: number): boolean { return db.prepare('DELETE FROM brews WHERE id = ?').run(id).changes > 0; }
};
export default brewRepository;
