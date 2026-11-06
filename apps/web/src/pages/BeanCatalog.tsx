import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBeanStore } from '../store/useBeanStore';
import type { Bean } from '@brobean/shared';

type BeanForm = {
  name: string;
  roastery: string;
  latitude?: string | number;
  longitude?: string | number;
};

type Notice = { kind: 'success' | 'error' | 'info'; message: string } | null;

export default function BeanCatalog() {
  const { beans, isLoading, error, isSubmitLoading, fetchBeans, addBean, editBean, removeBean } = useBeanStore();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BeanForm>();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fetchBeans();
  }, [fetchBeans]);

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
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const onSubmit = async (data: BeanForm) => {
    const payload: Partial<Bean> = {
      name: data.name.trim(),
      roastery: data.roastery.trim(),
      latitude: data.latitude === '' || data.latitude == null ? undefined : Number(data.latitude),
      longitude: data.longitude === '' || data.longitude == null ? undefined : Number(data.longitude),
      photoBase64: photoPreview || undefined,
    };
    const success = editingId ? await editBean(editingId, payload) : await addBean(payload);
    if (success) {
      setNotice({ kind: 'success', message: editingId ? 'Perubahan kopi berhasil disimpan.' : 'Kopi berhasil ditambahkan ke koleksi.' });
      reset();
      setPhotoPreview(null);
      setEditingId(null);
      setLocationError(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    } else {
      setNotice({ kind: 'error', message: 'Data belum berhasil disimpan. Periksa koneksi API lalu coba lagi.' });
    }
  };

  const handleGetLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    setNotice({ kind: 'info', message: 'Meminta lokasi perangkat… Izinkan akses lokasi pada browser jika diminta.' });
    if (!navigator.geolocation) {
      setLocationError('Browser ini tidak mendukung GPS.');
      setLocationLoading(false);
      setNotice({ kind: 'error', message: 'Browser tidak mendukung layanan lokasi.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude, { shouldDirty: true });
        setValue('longitude', position.coords.longitude, { shouldDirty: true });
        setLocationLoading(false);
        setNotice({ kind: 'success', message: 'Koordinat lokasi berhasil diambil.' });
      },
      (geoError) => {
        const message = geoError.code === geoError.PERMISSION_DENIED
          ? 'Izin lokasi ditolak. Aktifkan izin lokasi pada browser.'
          : 'Lokasi tidak ditemukan. Pastikan GPS aktif lalu coba lagi.';
        setLocationError(message);
        setLocationLoading(false);
        setNotice({ kind: 'error', message });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotice({ kind: 'error', message: 'Pilih file gambar dengan format yang didukung.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice({ kind: 'error', message: 'Ukuran foto maksimal 5 MB.' });
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(String(reader.result));
      setNotice({ kind: 'success', message: 'Foto berhasil dipilih. Simpan formulir untuk menerapkan perubahan.' });
    };
    reader.onerror = () => setNotice({ kind: 'error', message: 'Foto gagal dibaca. Silakan pilih ulang.' });
    reader.readAsDataURL(file);
  };

  const startEditing = (bean: Bean) => {
    setEditingId(bean.id ?? null);
    setValue('name', bean.name);
    setValue('roastery', bean.roastery);
    setValue('latitude', bean.latitude ?? '');
    setValue('longitude', bean.longitude ?? '');
    setPhotoPreview(bean.photoBase64 || null);
    setLocationError(null);
    setNotice({ kind: 'info', message: `Mode edit aktif untuk ${bean.name}.` });
    window.setTimeout(() => formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus(), 50);
  };

  const cancelEditing = () => {
    setEditingId(null);
    reset();
    setPhotoPreview(null);
    setLocationError(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
    setNotice({ kind: 'info', message: 'Perubahan dibatalkan.' });
  };

  const handleDelete = async (bean: Bean) => {
    if (!bean.id) return;
    if (!window.confirm(`Hapus ${bean.name} dari koleksi? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(bean.id);
    try {
      const success = await removeBean(bean.id);
      setNotice(success
        ? { kind: 'success', message: `${bean.name} berhasil dihapus.` }
        : { kind: 'error', message: `Gagal menghapus ${bean.name}. Silakan coba lagi.` });
    } catch {
      setNotice({ kind: 'error', message: `Gagal menghapus ${bean.name}. Silakan coba lagi.` });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="brobean-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label="Brobean, kembali ke atas">
            <span className="brand-mark" aria-hidden="true">b.</span>
            <span>brobean<span className="brand-period">.</span></span>
          </a>
          <div className="topbar-meta"><span className="status-dot" /> PERSONAL COFFEE LOG</div>
        </div>
      </header>

      <main id="top" className="page-wrap">
        <section className="intro-block" aria-labelledby="page-title">
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR COFFEE, YOUR STORY</div>
          <div className="intro-row">
            <div>
              <h1 id="page-title">Coffee, <em>collected.</em></h1>
              <p className="intro-copy">Simpan biji kopi favoritmu, catat asalnya, dan bangun arsip perjalanan seduhmu satu per satu.</p>
            </div>
            <div className="bean-count" aria-label={`${beans.length} koleksi kopi`}>
              <span className="bean-count-number">{String(beans.length).padStart(2, '0')}</span>
              <span className="bean-count-label">BEANS<br />COLLECTED</span>
            </div>
          </div>
        </section>

        {notice && (
          <div className={`notice notice-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'} aria-live="polite">
            <span className="notice-symbol" aria-hidden="true">{notice.kind === 'success' ? '✓' : notice.kind === 'error' ? '!' : 'i'}</span>
            <span>{notice.message}</span>
            <button type="button" className="notice-close" onClick={() => setNotice(null)} aria-label="Tutup pemberitahuan">×</button>
          </div>
        )}

        <div className="workspace-grid">
          <section className="form-panel" aria-labelledby="form-title">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">01 / BEAN DETAILS</span>
                <h2 id="form-title">{editingId ? 'Update your bean' : 'Add a new bean'}</h2>
              </div>
              <span className="heading-icon" aria-hidden="true">＋</span>
            </div>
            <p className="panel-description">Mulai dengan mengenali biji kopi yang sedang kamu nikmati.</p>

            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="bean-form" noValidate>
              <div className="field-group">
                <label htmlFor="bean-name">Nama kopi <span className="required-mark">*</span></label>
                <input id="bean-name" type="text" autoComplete="off" placeholder="Contoh: Gayo Wine" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'bean-name-error' : 'bean-name-hint'} {...register('name', { required: 'Nama kopi wajib diisi.', minLength: { value: 2, message: 'Nama kopi minimal 2 karakter.' } })} />
                {errors.name ? <span id="bean-name-error" className="field-error">{errors.name.message}</span> : <span id="bean-name-hint" className="field-hint">Nama yang tertera pada kemasan kopi.</span>}
              </div>
              <div className="field-group">
                <label htmlFor="bean-roastery">Roastery <span className="required-mark">*</span></label>
                <input id="bean-roastery" type="text" autoComplete="organization" placeholder="Contoh: Space Roastery" aria-invalid={Boolean(errors.roastery)} aria-describedby={errors.roastery ? 'bean-roastery-error' : 'bean-roastery-hint'} {...register('roastery', { required: 'Nama roastery wajib diisi.' })} />
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
                  {isSubmitLoading ? <><span className="button-spinner" /> Menyimpan…</> : editingId ? 'Simpan perubahan' : 'Simpan ke koleksi'}
                  {!isSubmitLoading && <span aria-hidden="true">↗</span>}
                </button>
                {editingId && <button className="secondary-button" type="button" onClick={cancelEditing}>Batalkan edit</button>}
              </div>
              <p className="form-footnote"><span aria-hidden="true">✳</span> Data bertanda * wajib diisi.</p>
            </form>
          </section>

          <section className="collection-panel" aria-labelledby="collection-title">
            <div className="collection-heading">
              <div>
                <span className="section-kicker">02 / YOUR LIBRARY</span>
                <h2 id="collection-title">The collection<span className="title-period">.</span></h2>
              </div>
              <span className="collection-total">{beans.length} {beans.length === 1 ? 'BEAN' : 'BEANS'}</span>
            </div>
            <div className="collection-rule" />

            {isLoading && (
              <div className="state-card" role="status"><span className="state-loader" /><strong>Menyiapkan koleksi…</strong><span>Mengambil data kopi kamu.</span></div>
            )}
            {error && !isLoading && (
              <div className="state-card state-error" role="alert"><span className="state-icon">!</span><strong>Koleksi belum dapat dimuat</strong><span>{error}</span><button type="button" className="retry-button" onClick={() => void fetchBeans()}>Coba muat ulang ↻</button></div>
            )}
            {!isLoading && !error && beans.length === 0 && (
              <div className="empty-state">
                <div className="empty-illustration" aria-hidden="true"><span>☕</span></div>
                <span className="section-kicker">A FRESH START</span>
                <h3>Your coffee story<br /><em>starts here.</em></h3>
                <p>Belum ada biji kopi tersimpan. Tambahkan koleksi pertamamu melalui formulir di samping.</p>
                <span className="empty-hint">← MULAI DARI FORM TAMBAH KOPI</span>
              </div>
            )}
            {!isLoading && !error && beans.length > 0 && (
              <div className="bean-grid">
                {beans.map((bean, index) => (
                  <article className="bean-card" key={bean.id ?? `${bean.name}-${index}`}>
                    <div className="bean-card-image">
                      {bean.photoBase64 ? <img src={bean.photoBase64} alt={`Kemasan ${bean.name}`} loading="lazy" /> : <div className="bean-image-fallback" aria-hidden="true"><span>☕</span><small>NO PHOTO</small></div>}
                      <span className="bean-index">BEAN {String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="bean-card-content">
                      <h3 title={bean.name}>{bean.name}</h3>
                      <p className="roastery-name"><span aria-hidden="true">✳</span> {bean.roastery}</p>
                      {bean.latitude != null && bean.longitude != null && <p className="bean-coordinates">⌖ {Number(bean.latitude).toFixed(3)}, {Number(bean.longitude).toFixed(3)}</p>}
                      <div className="bean-card-actions">
                        <button type="button" onClick={() => startEditing(bean)} aria-label={`Edit ${bean.name}`}>Edit <span aria-hidden="true">↗</span></button>
                        <button type="button" className="delete-action" onClick={() => void handleDelete(bean)} disabled={deletingId === bean.id} aria-label={`Hapus ${bean.name}`}>{deletingId === bean.id ? 'Menghapus…' : 'Hapus'}</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
        <footer className="page-footer"><span>BREW SLOW. KEEP NOTES.</span><span>BROBEAN © 2026</span></footer>
      </main>
    </div>
  );
}
