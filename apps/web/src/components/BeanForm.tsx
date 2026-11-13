import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Bean } from '@brobean/shared';
import { validateBeanName, validateRoastery } from '../utils/validation';

type BeanFormValues = {
  name: string;
  roastery: string;
  latitude?: string | number;
  longitude?: string | number;
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
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BeanFormValues>();
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
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
        window.requestAnimationFrame(() => active.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
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
        latitude: editingBean.latitude ?? '',
        longitude: editingBean.longitude ?? '',
      });
      setPhotoPreview(editingBean.photoBase64 || null);
      setLocationError(null);
      window.setTimeout(() => formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus(), 50);
    } else {
      reset();
      setPhotoPreview(null);
      setLocationError(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }, [editingBean, reset]);

  const handleFormSubmit = async (data: BeanFormValues) => {
    const payload: Partial<Bean> = {
      name: data.name.trim(),
      roastery: data.roastery.trim(),
      latitude: data.latitude === '' || data.latitude == null ? undefined : Number(data.latitude),
      longitude: data.longitude === '' || data.longitude == null ? undefined : Number(data.longitude),
      photoBase64: photoPreview || undefined,
    };

    const success = await onSave(payload);
    if (success) {
      reset();
      setPhotoPreview(null);
      setLocationError(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleGetLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    onNotice({ kind: 'info', message: 'Meminta lokasi perangkat… Izinkan akses lokasi pada browser jika diminta.' });

    if (!navigator.geolocation) {
      setLocationError('Browser ini tidak mendukung GPS.');
      setLocationLoading(false);
      onNotice({ kind: 'error', message: 'Browser tidak mendukung layanan lokasi.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude, { shouldDirty: true });
        setValue('longitude', position.coords.longitude, { shouldDirty: true });
        setLocationLoading(false);
        onNotice({ kind: 'success', message: 'Koordinat lokasi berhasil diambil.' });
      },
      (geoError) => {
        const message = geoError.code === geoError.PERMISSION_DENIED
          ? 'Izin lokasi ditolak. Aktifkan izin lokasi pada browser.'
          : 'Lokasi tidak ditemukan. Pastikan GPS aktif lalu coba lagi.';
        setLocationError(message);
        setLocationLoading(false);
        onNotice({ kind: 'error', message });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
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
      onNotice({ kind: 'success', message: 'Foto berhasil dipilih. Simpan formulir untuk menerapkan perubahan.' });
    };
    reader.onerror = () => onNotice({ kind: 'error', message: 'Foto gagal dibaca. Silakan pilih ulang.' });
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    reset();
    setPhotoPreview(null);
    setLocationError(null);
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
      <p className="panel-description">Mulai dengan mengenali biji kopi yang sedang kamu nikmati.</p>

      <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)} className="bean-form" noValidate>
        <div className="field-group">
          <label htmlFor="bean-name">Nama kopi <span className="required-mark">*</span></label>
          <input id="bean-name" type="text" autoComplete="off" placeholder="Contoh: Gayo Wine" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'bean-name-error' : 'bean-name-hint'} {...register('name', { validate: validateBeanName })} />
          {errors.name ? <span id="bean-name-error" className="field-error">{errors.name.message}</span> : <span id="bean-name-hint" className="field-hint">Nama yang tertera pada kemasan kopi.</span>}
        </div>

        <div className="field-group">
          <label htmlFor="bean-roastery">Roastery <span className="required-mark">*</span></label>
          <input id="bean-roastery" type="text" autoComplete="organization" placeholder="Contoh: Space Roastery" aria-invalid={Boolean(errors.roastery)} aria-describedby={errors.roastery ? 'bean-roastery-error' : 'bean-roastery-hint'} {...register('roastery', { validate: validateRoastery })} />
          {errors.roastery ? <span id="bean-roastery-error" className="field-error">{errors.roastery.message}</span> : <span id="bean-roastery-hint" className="field-hint">Tempat atau brand yang menyangrai kopi.</span>}
        </div>

        <div className="subsection-heading"><span>ORIGIN LOCATION</span><span className="optional-label">OPTIONAL</span></div>
        <button className="location-button" type="button" onClick={handleGetLocation} disabled={locationLoading}>
          <span className="location-pin" aria-hidden="true">⌖</span>
          <span>{locationLoading ? 'Mencari lokasi…' : 'Gunakan lokasi perangkat'}</span>
          <span className="button-arrow" aria-hidden="true">→</span>
        </button>
        <div className="coordinate-row">
          <div className="field-group compact-field">
            <label htmlFor="bean-latitude">Latitude</label>
            <input id="bean-latitude" inputMode="decimal" placeholder="-6.200000" readOnly {...register('latitude')} />
          </div>
          <div className="field-group compact-field">
            <label htmlFor="bean-longitude">Longitude</label>
            <input id="bean-longitude" inputMode="decimal" placeholder="106.816666" readOnly {...register('longitude')} />
          </div>
        </div>
        {locationError && <p className="field-error" role="alert">{locationError}</p>}

        <div className="subsection-heading photo-heading"><span>BEAN BAG PHOTO</span><span className="optional-label">OPTIONAL · MAX 5 MB</span></div>
        <div className="photo-picker-wrap">
          <input ref={photoInputRef} id="bean-photo" className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} aria-label="Pilih atau ambil foto kemasan kopi" />
          <label htmlFor="bean-photo" className="photo-picker">
            {photoPreview ? <img src={photoPreview} alt="Preview foto kemasan kopi yang dipilih" /> : <span className="photo-placeholder" aria-hidden="true">▧</span>}
            <span className="photo-picker-copy"><strong>{photoPreview ? 'Ganti foto kemasan' : 'Tambahkan foto kemasan'}</strong><small>{photoPreview ? 'Foto siap disimpan bersama data kopi' : 'Ambil foto atau pilih dari perangkat'}</small></span>
            <span className="photo-add" aria-hidden="true">＋</span>
          </label>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={isSubmitLoading}>
            {isSubmitLoading ? <><span className="button-spinner" /> Menyimpan…</> : editingBean ? 'Simpan perubahan' : 'Simpan ke koleksi'}
            {!isSubmitLoading && <span aria-hidden="true">↗</span>}
          </button>
          {editingBean && <button className="secondary-button" type="button" onClick={handleCancel}>Batalkan edit</button>}
        </div>
        <p className="form-footnote"><span aria-hidden="true">✳</span> Data bertanda * wajib diisi.</p>
      </form>
    </section>
  );
}
