import db from '../config/database.js';

export interface PreparationRow {
  id: number; name: string; slug: string; note: string | null;
  style_type: string; is_builtin: number; use_custom_parameters: number;
  archived_at: string | null; created_at: string; updated_at: string;
}
export interface ParameterDefinitionRow {
  parameter_key: string; label: string; value_type: 'text' | 'number' | 'duration' | 'boolean' | 'text_list';
  unit: string | null; phase: 'before' | 'during' | 'after'; default_enabled: number; sort_order: number;
}
export interface PreparationParameterRow extends ParameterDefinitionRow {
  is_enabled: number; preparation_phase: 'before' | 'during' | 'after';
  preparation_sort_order: number; is_required: number;
}

const preparationRepository = {
  findAll(includeArchived = false): PreparationRow[] {
    return db.prepare(`SELECT * FROM preparations ${includeArchived ? '' : 'WHERE archived_at IS NULL'} ORDER BY is_builtin DESC, name COLLATE NOCASE`).all() as PreparationRow[];
  },
  findById(id: number): PreparationRow | undefined {
    return db.prepare('SELECT * FROM preparations WHERE id = ?').get(id) as PreparationRow | undefined;
  },
  create(data: { name: string; slug: string; note?: string; styleType?: string }): number {
    const result = db.prepare(`INSERT INTO preparations (name, slug, note, style_type, is_builtin) VALUES (?, ?, ?, ?, 0)`)
      .run(data.name, data.slug, data.note ?? null, data.styleType ?? 'CUSTOM_PREPARATION');
    const id = Number(result.lastInsertRowid);
    const defaults = db.prepare(`INSERT INTO preparation_parameters (preparation_id, parameter_key, is_enabled, phase, sort_order, is_required)
      SELECT ?, parameter_key, default_enabled, phase, sort_order, 0 FROM brew_parameter_definitions`).run(id);
    void defaults;
    return id;
  },
  update(id: number, data: { name?: string; slug?: string; note?: string | null; styleType?: string }): void {
    const fields: string[] = []; const values: unknown[] = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.slug !== undefined) { fields.push('slug = ?'); values.push(data.slug); }
    if (data.note !== undefined) { fields.push('note = ?'); values.push(data.note); }
    if (data.styleType !== undefined) { fields.push('style_type = ?'); values.push(data.styleType); }
    if (!fields.length) return;
    fields.push('updated_at = CURRENT_TIMESTAMP'); values.push(id);
    db.prepare(`UPDATE preparations SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  },
  archive(id: number): void { db.prepare('UPDATE preparations SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id); },
  restore(id: number): void { db.prepare('UPDATE preparations SET archived_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id); },
  findParameters(id: number): PreparationParameterRow[] {
    return db.prepare(`SELECT d.*, pp.is_enabled, pp.phase AS preparation_phase,
      pp.sort_order AS preparation_sort_order, pp.is_required
      FROM preparation_parameters pp JOIN brew_parameter_definitions d ON d.parameter_key = pp.parameter_key
      WHERE pp.preparation_id = ? ORDER BY CASE pp.phase WHEN 'before' THEN 1 WHEN 'during' THEN 2 ELSE 3 END, pp.sort_order, d.label`).all(id) as PreparationParameterRow[];
  },
  updateParameters(id: number, parameters: Array<{ key: string; enabled: boolean; phase?: string; sortOrder?: number; required?: boolean }>): void {
    const update = db.prepare(`UPDATE preparation_parameters SET is_enabled = ?, phase = ?, sort_order = ?, is_required = ? WHERE preparation_id = ? AND parameter_key = ?`);
    const tx = db.transaction(() => {
      for (const p of parameters) update.run(p.enabled ? 1 : 0, p.phase ?? 'before', p.sortOrder ?? 0, p.required ? 1 : 0, id, p.key);
    });
    tx();
  }
};
export default preparationRepository;
