import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Bean, Brew, BrewParameterValue, Preparation, PreparationParameter } from '@brobean/shared';
import { brewRepository } from '../../services/brewRepository';
import BrewParameterFields from './BrewParameterFields';
import BrewRating from './BrewRating';

interface Props {
  beans: Bean[];
  preparations: Preparation[];
  initialBrew?: Brew | null;
  onSave: (data: Omit<Brew, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Brew | null>;
  onCancel: () => void;
}

function toLocalDateTime(value?: string): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export default function BrewForm({ beans, preparations, initialBrew, onSave, onCancel }: Props) {
  const [beanId, setBeanId] = useState(initialBrew?.beanId ? String(initialBrew.beanId) : '');
  const [preparationId, setPreparationId] = useState(initialBrew?.preparationId ? String(initialBrew.preparationId) : '');
  const [rating, setRating] = useState(initialBrew?.rating ?? 0);
  const [brewedAt, setBrewedAt] = useState(toLocalDateTime(initialBrew?.brewedAt));
  const [note, setNote] = useState(initialBrew?.note ?? '');
  const [values, setValues] = useState<Record<string, BrewParameterValue>>(initialBrew?.values ?? {});
  const [parameters, setParameters] = useState<PreparationParameter[]>([]);
  const [isParametersLoading, setIsParametersLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const availableBeans = useMemo(() => beans.filter((bean) => !bean.archivedAt && typeof bean.id === 'number'), [beans]);
  const selectedPreparation = preparations.find((item) => item.id === Number(preparationId));
  const selectablePreparations = preparations.filter((item) => !item.archived_at || item.id === initialBrew?.preparationId);

  useEffect(() => {
    if (!preparationId) {
      setParameters([]);
      return;
    }
    let cancelled = false;
    setIsParametersLoading(true);
    brewRepository.getPreparationParameters(Number(preparationId))
      .then((result) => {
        if (!cancelled) {
          setParameters(result);
          setValues((current) => {
            const next = { ...current };
            result.forEach((parameter) => {
              if (parameter.is_enabled === 1 && parameter.is_required === 1 && parameter.value_type === 'boolean' && next[parameter.parameter_key] === undefined) {
                next[parameter.parameter_key] = false;
              }
            });
            return next;
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setParameters([]);
          setFormError('Parameter brewing method gagal dimuat. Coba pilih ulang metodenya.');
        }
      })
      .finally(() => { if (!cancelled) setIsParametersLoading(false); });
    return () => { cancelled = true; };
  }, [preparationId]);

  const handlePreparationChange = (nextId: string) => {
    if (nextId === preparationId) return;
    setPreparationId(nextId);
    setValues({});
    setParameters([]);
    setFormError(null);
  };

  const handleParameterChange = (key: string, value: BrewParameterValue | undefined) => {
    setValues((current) => {
      const next = { ...current };
      if (value === undefined || value === '') delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!beanId || !preparationId) {
      setFormError('Pilih coffee bean dan brewing method terlebih dahulu.');
      return;
    }
    if (!rating) {
      setFormError('Rating wajib dipilih sebelum menyimpan Brew Log.');
      return;
    }
    if (!brewedAt || Number.isNaN(new Date(brewedAt).getTime())) {
      setFormError('Tanggal dan waktu seduh tidak valid.');
      return;
    }
    const missing = parameters.find((parameter) => parameter.is_enabled === 1 && parameter.is_required === 1 && (values[parameter.parameter_key] === undefined || values[parameter.parameter_key] === '' || (Array.isArray(values[parameter.parameter_key]) && (values[parameter.parameter_key] as string[]).length === 0)));
    if (missing) {
      setFormError(`${missing.label} wajib diisi.`);
      return;
    }
    setIsSaving(true);
    try {
      const result = await onSave({
        beanId: Number(beanId),
        preparationId: Number(preparationId),
        rating,
        brewedAt: new Date(brewedAt).toISOString(),
        note: note.trim(),
        values,
      });
      if (!result) setFormError('Brew Log belum berhasil disimpan. Periksa koneksi API dan coba lagi.');
    } catch {
      setFormError('Brew Log belum berhasil disimpan. Periksa koneksi API dan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="brew-form-panel" aria-labelledby="brew-form-title">
      <div className="brew-form-heading">
        <div>
          <span className="section-kicker">YOUR BREWING JOURNAL</span>
          <h2 id="brew-form-title">{initialBrew ? 'Edit Brew.' : 'New Brew.'}</h2>
          <p>Capture the details of your coffee, from preparation to the final cup.</p>
        </div>
        <button type="button" className="brew-close-button" onClick={onCancel} aria-label="Close form">×</button>
      </div>

      <form className="brew-form" onSubmit={handleSubmit}>
        <div className="brew-form-section">
          <div className="brew-section-title"><span>01</span><h3>Coffee & Method</h3></div>
          <div className="brew-form-grid">
            <div className="field-group">
              <label htmlFor="brew-bean">Coffee bean <span className="required-mark">*</span></label>
              <select id="brew-bean" required value={beanId} onChange={(event) => setBeanId(event.target.value)} disabled={isSaving}>
                <option value="">Select a coffee bean</option>
                {availableBeans.map((bean) => <option key={bean.id} value={bean.id}>{bean.name} · {bean.roastery}</option>)}
              </select>
              {!availableBeans.length ? <small className="field-hint">Add an active coffee bean in Bean Library first.</small> : null}
            </div>
            <div className="field-group">
              <label htmlFor="brew-method">Brewing method <span className="required-mark">*</span></label>
              <select id="brew-method" required value={preparationId} onChange={(event) => handlePreparationChange(event.target.value)} disabled={isSaving}>
                <option value="">Select a brewing method</option>
                {selectablePreparations.map((preparation) => <option key={preparation.id} value={preparation.id} disabled={Boolean(preparation.archived_at)}>{preparation.name}{preparation.archived_at ? ' (Archived — existing entry)' : ''}</option>)}
              </select>
              {selectedPreparation?.note ? <small className="field-hint">{selectedPreparation.note}</small> : null}
              {selectedPreparation?.archived_at ? <small className="field-hint">This method is archived. Keep it for this historical entry or select an active method.</small> : null}
            </div>
            <div className="field-group">
              <label htmlFor="brew-date">Brewed at <span className="required-mark">*</span></label>
              <input id="brew-date" type="datetime-local" required value={brewedAt} onChange={(event) => setBrewedAt(event.target.value)} disabled={isSaving} />
            </div>
          </div>
        </div>

        <div className="brew-form-section">
          <div className="brew-section-title"><span>02</span><div><h3>Brewing Parameters</h3><p>Fields are based on the selected brewing method.</p></div></div>
          {!preparationId ? <div className="brew-parameter-prompt">Choose a brewing method to see its parameters.</div> : isParametersLoading ? <div className="brew-parameter-prompt" role="status">Loading method parameters…</div> : <BrewParameterFields parameters={parameters} values={values} onChange={handleParameterChange} disabled={isSaving} />}
        </div>

        <div className="brew-form-section">
          <div className="brew-section-title"><span>03</span><div><h3>Your Impression</h3><p>Rate the cup and leave a note for next time.</p></div></div>
          <div className="field-group">
            <label>Overall rating <span className="required-mark">*</span></label>
            <BrewRating value={rating} onChange={setRating} disabled={isSaving} />
          </div>
          <div className="field-group">
            <label htmlFor="brew-note">Tasting notes / impression</label>
            <textarea id="brew-note" rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What did you notice in this cup? Sweetness, acidity, body, aroma…" disabled={isSaving} />
          </div>
        </div>

        {formError ? <p className="brew-form-error" role="alert">{formError}</p> : null}
        <div className="brew-form-actions">
          <button type="button" className="brew-cancel-button" onClick={onCancel} disabled={isSaving}>Cancel</button>
          <button type="submit" className="brew-save-button" disabled={isSaving || isParametersLoading}>
            {isSaving ? 'Saving…' : initialBrew ? 'Save Changes' : 'Save Brew'} <span aria-hidden="true">→</span>
          </button>
        </div>
        <p className="brew-required-hint"><span>*</span> Required fields</p>
      </form>
    </section>
  );
}
