
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Bean } from '@brobean/shared';
import { validateBeanName, validateRoastery } from '../utils/validation';

type BeanFormValues = {
  name: string;
  roastery: string;
  originCountry: string;
  originRegion: string;
  originFarm: string;
  variety: string;
  process: string;
  roastLevel: string;
  roastDate: string;
  bagWeightGrams: string;
  price: string;
  notes: string;
};

type Notice = { kind: 'success' | 'error' | 'info'; message: string };

type BeanFormProps = {
  editingBean: Bean | null;
  isSubmitLoading: boolean;
  onSave: (payload: Partial<Bean>) => Promise<boolean>;
  onCancelEdit: () => void;
  onNotice: (notice: Notice) => void;
};

export default function BeanForm({
  editingBean,
  isSubmitLoading,
  onSave,
  onCancelEdit,
  onNotice,
}: BeanFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BeanFormValues>();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Keep the focused field visible when the on-screen keyboard changes the visual viewport.
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const keepFocusedFieldVisible = () => {
      const active = document.activeElement;
      if (active instanceof HTMLElement && formRef.current?.contains(active)) {
        window.requestAnimationFrame(() =>
          active.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
        );
      }
    };

    viewport.addEventListener('resize', keepFocusedFieldVisible);
    viewport.addEventListener('scroll', keepFocusedFieldVisible);

    return () => {
      viewport.removeEventListener('resize', keepFocusedFieldVisible);
      viewport.removeEventListener('scroll', keepFocusedFieldVisible);
    };
  }, []);

  useEffect(() => {
    if (editingBean) {
      reset({
        name: editingBean.name,
        roastery: editingBean.roastery,
        originCountry: editingBean.originCountry ?? '',
        originRegion: editingBean.originRegion ?? '',
        originFarm: editingBean.originFarm ?? '',
        variety: editingBean.variety ?? '',
        process: editingBean.process ?? '',
        roastLevel: editingBean.roastLevel ?? '',
        roastDate: editingBean.roastDate ?? '',
        bagWeightGrams: editingBean.bagWeightGrams?.toString() ?? '',
        price: editingBean.price?.toString() ?? '',
        notes: editingBean.notes ?? '',
      });

      setPhotoPreview(editingBean.photoBase64 || null);
      window.setTimeout(
        () => formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus(),
        50,
      );
    } else {
      reset();
      setPhotoPreview(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }, [editingBean, reset]);

  const handleFormSubmit = async (data: BeanFormValues) => {
    const payload: Partial<Bean> = {
      name: data.name.trim(),
      roastery: data.roastery.trim(),
      originCountry: data.originCountry.trim() || undefined,
      originRegion: data.originRegion.trim() || undefined,
      originFarm: data.originFarm.trim() || undefined,
      variety: data.variety.trim() || undefined,
      process: data.process || undefined,
      roastLevel: data.roastLevel || undefined,
      roastDate: data.roastDate || undefined,
      bagWeightGrams:
        data.bagWeightGrams.trim() === '' ? undefined : Number(data.bagWeightGrams),
      price: data.price.trim() === '' ? undefined : Number(data.price),
      notes: data.notes.trim() || undefined,
      photoBase64: photoPreview || undefined,
    };

    const success = await onSave(payload);

    if (success) {
      reset();
      setPhotoPreview(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotice({ kind: 'error', message: 'Pilih file gambar dengan format yang didukung.' });
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onNotice({ kind: 'error', message: 'Ukuran foto maksimal 5 MB.' });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhotoPreview(String(reader.result));
      onNotice({
        kind: 'success',
        message: 'Foto berhasil dipilih. Simpan formulir untuk menerapkan perubahan.',
      });
    };

    reader.onerror = () =>
      onNotice({ kind: 'error', message: 'Foto gagal dibaca. Silakan pilih ulang.' });

    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    reset();
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
    onCancelEdit();
  };

  return (
    <section className="form-panel" aria-labelledby="form-title">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">01 / BEAN DETAILS</span>
          <h2 id="form-title">{editingBean ? 'Update your bean' : 'Add a new bean'}</h2>
        </div>
        <span className="heading-icon" aria-hidden="true">＋</span>
      </div>

      <p className="panel-description">
        Mulai dengan mengenali biji kopi yang sedang kamu nikmati.
      </p>

      <form
        ref={formRef}
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bean-form"
        noValidate
      >
        <div className="field-group">
          <label htmlFor="bean-name">
            Nama kopi <span className="required-mark">*</span>
          </label>
          <input
            id="bean-name"
            type="text"
            autoComplete="off"
            placeholder="Contoh: Gayo Wine"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'bean-name-error' : 'bean-name-hint'}
            {...register('name', { validate: validateBeanName })}
          />
          {errors.name ? (
            <span id="bean-name-error" className="field-error">{errors.name.message}</span>
          ) : (
            <span id="bean-name-hint" className="field-hint">
              Nama yang tertera pada kemasan kopi.
            </span>
          )}
        </div>

        <div className="field-group">
          <label htmlFor="bean-roastery">
            Roastery <span className="required-mark">*</span>
          </label>
          <input
            id="bean-roastery"
            type="text"
            autoComplete="organization"
            placeholder="Contoh: Space Roastery"
            aria-invalid={Boolean(errors.roastery)}
            aria-describedby={errors.roastery ? 'bean-roastery-error' : 'bean-roastery-hint'}
            {...register('roastery', { validate: validateRoastery })}
          />
          {errors.roastery ? (
            <span id="bean-roastery-error" className="field-error">{errors.roastery.message}</span>
          ) : (
            <span id="bean-roastery-hint" className="field-hint">
              Tempat atau brand yang menyangrai kopi.
            </span>
          )}
        </div>

        <div className="subsection-heading">
          <span>ORIGIN LOCATION</span>
          <span className="optional-label">OPTIONAL</span>
        </div>

        <div className="field-group">
          <label htmlFor="origin-country">Negara asal</label>
          <input
            id="origin-country"
            type="text"
            placeholder="Contoh: Indonesia"
            {...register('originCountry')}
          />
        </div>

        <div className="field-group">
          <label htmlFor="origin-region">Wilayah / daerah</label>
          <input
            id="origin-region"
            type="text"
            placeholder="Contoh: Aceh, Gayo"
            {...register('originRegion')}
          />
        </div>

        <div className="field-group">
          <label htmlFor="origin-farm">Farm / perkebunan</label>
          <input
            id="origin-farm"
            type="text"
            placeholder="Contoh: Pantan Musara Farm"
            {...register('originFarm')}
          />
        </div>

        <div className="subsection-heading">
          <span>BEAN CHARACTERISTICS</span>
          <span className="optional-label">OPTIONAL</span>
        </div>

        <div className="field-group">
          <label htmlFor="bean-variety">Variety</label>
          <input
            id="bean-variety"
            type="text"
            placeholder="Contoh: Arabica, Typica, Bourbon"
            {...register('variety')}
          />
        </div>

        <div className="field-group">
          <label htmlFor="bean-process">Processing method</label>
          <select id="bean-process" {...register('process')}>
            <option value="">Pilih processing method</option>
            <option value="Washed">Washed</option>
            <option value="Natural">Natural</option>
            <option value="Honey">Honey</option>
            <option value="Anaerobic">Anaerobic</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="bean-roast-level">Roast level</label>
          <select id="bean-roast-level" {...register('roastLevel')}>
            <option value="">Pilih roast level</option>
            <option value="Light">Light</option>
            <option value="Medium">Medium</option>
            <option value="Medium-Dark">Medium-Dark</option>
            <option value="Dark">Dark</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="bean-roast-date">Roast date</label>
          <input
            id="bean-roast-date"
            type="date"
            {...register('roastDate')}
          />
        </div>

        <div className="subsection-heading">
          <span>PURCHASE INFORMATION</span>
          <span className="optional-label">OPTIONAL</span>
        </div>

        <div className="field-group">
          <label htmlFor="bean-weight">Berat kemasan (gram)</label>
          <input
            id="bean-weight"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="Contoh: 200"
            {...register('bagWeightGrams')}
          />
        </div>

        <div className="field-group">
          <label htmlFor="bean-price">Harga (Rp)</label>
          <input
            id="bean-price"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="Contoh: 85000"
            {...register('price')}
          />
        </div>

        <div className="subsection-heading">
  <span>ADDITIONAL DETAILS</span>
  <span className="optional-label">OPTIONAL</span>
</div>

<div className="field-group">
  <label htmlFor="bean-notes">Additional Notes</label>
  <textarea
    id="bean-notes"
    rows={4}
    placeholder="Catatan tentang karakteristik kopi, pengalaman, atau informasi lainnya..."
    {...register('notes')}
  />
  <span className="field-hint">
    Tambahkan informasi lain yang ingin kamu ingat tentang kopi ini.
  </span>
</div>

        <div className="subsection-heading photo-heading">
          <span>BEAN BAG PHOTO</span>
          <span className="optional-label">OPTIONAL · MAX 5 MB</span>
        </div>

        <div className="photo-picker-wrap">
          <input
            ref={photoInputRef}
            id="bean-photo"
            className="visually-hidden"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            aria-label="Pilih atau ambil foto kemasan kopi"
          />
          <label htmlFor="bean-photo" className="photo-picker">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview foto kemasan kopi yang dipilih" />
            ) : (
              <span className="photo-placeholder" aria-hidden="true">▧</span>
            )}
            <span className="photo-picker-copy">
              <strong>{photoPreview ? 'Ganti foto kemasan' : 'Tambahkan foto kemasan'}</strong>
              <small>
                {photoPreview
                  ? 'Foto siap disimpan bersama data kopi'
                  : 'Ambil foto atau pilih dari perangkat'}
              </small>
            </span>
            <span className="photo-add" aria-hidden="true">＋</span>
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={isSubmitLoading}>
            {isSubmitLoading ? (
              <>
                <span className="button-spinner" /> Menyimpan…
              </>
            ) : editingBean ? (
              'Simpan perubahan'
            ) : (
              'Simpan ke koleksi'
            )}
            {!isSubmitLoading && <span aria-hidden="true">↗</span>}
          </button>
          {editingBean && (
            <button className="secondary-button" type="button" onClick={handleCancel}>
              Batalkan edit
            </button>
          )}
        </div>

        <p className="form-footnote">
          <span aria-hidden="true">✳</span> Data bertanda * wajib diisi.
        </p>
      </form>
    </section>
  );
}
