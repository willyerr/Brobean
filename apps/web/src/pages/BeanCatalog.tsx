
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBeanStore } from '../store/useBeanStore';
import type { Bean } from '@brobean/shared';
import BeanForm from '../components/BeanForm';

type Notice = {
  kind: 'success' | 'error' | 'info';
  message: string;
} | null;

type LibraryTab = 'active' | 'archived';

type SortOption =
  | 'recent'
  | 'name-asc'
  | 'name-desc'
  | 'roast-date';

export default function BeanCatalog() {
  const {
    beans,
    isLoading,
    error,
    isSubmitLoading,
    fetchBeans,
    addBean,
    editBean,
    archiveBean,
    restoreBean,
  } = useBeanStore();

  const [activeTab, setActiveTab] = useState<LibraryTab>('active');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filterRoast, setFilterRoast] = useState('');
  const [filterProcess, setFilterProcess] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingBean, setEditingBean] = useState<Bean | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    void fetchBeans();
  }, [fetchBeans]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const activeBeans = useMemo(
    () => beans.filter((bean) => !bean.archivedAt),
    [beans],
  );

  const archivedBeans = useMemo(
    () => beans.filter((bean) => Boolean(bean.archivedAt)),
    [beans],
  );

  const tabBeans = activeTab === 'active' ? activeBeans : archivedBeans;

  const hasRoastDate = tabBeans.some((bean) => Boolean(bean.roastDate));

  const roastOptions = useMemo(
    () => [...new Set(tabBeans.map((bean) => bean.roastLevel).filter(Boolean))].sort(),
    [tabBeans],
  );

  const processOptions = useMemo(
    () => [...new Set(tabBeans.map((bean) => bean.process).filter(Boolean))].sort(),
    [tabBeans],
  );

  const originOptions = useMemo(
    () =>
      [...new Set(
        tabBeans
          .map((bean) => bean.originRegion || bean.originCountry)
          .filter(Boolean),
      )].sort(),
    [tabBeans],
  );

  const filteredBeans = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = tabBeans.filter((bean) => {
      const matchesSearch =
        !query ||
        bean.name.toLowerCase().includes(query) ||
        bean.roastery.toLowerCase().includes(query);

      const matchesRoast =
        !filterRoast || bean.roastLevel === filterRoast;

      const matchesProcess =
        !filterProcess || bean.process === filterProcess;

      const origin = bean.originRegion || bean.originCountry || '';
      const matchesOrigin =
        !filterOrigin || origin === filterOrigin;

      return (
        matchesSearch &&
        matchesRoast &&
        matchesProcess &&
        matchesOrigin
      );
    });

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);

        case 'name-desc':
          return b.name.localeCompare(a.name);

        case 'roast-date':
          return (b.roastDate || '').localeCompare(a.roastDate || '');

        case 'recent':
        default:
          return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
    });
  }, [tabBeans, search, sortBy, filterRoast, filterProcess, filterOrigin]);

  const openAddForm = () => {
    setEditingBean(null);
    setShowForm(true);
  };

  const openEditForm = (bean: Bean) => {
    setEditingBean(bean);
    setShowForm(true);
    setOpenMenuId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBean(null);
  };

  const handleSaveBean = async (payload: Partial<Bean>) => {
    const success = editingBean?.id
      ? await editBean(editingBean.id, payload)
      : await addBean(payload);

    if (success) {
      setNotice({
        kind: 'success',
        message: editingBean
          ? 'Perubahan kopi berhasil disimpan.'
          : 'Kopi berhasil ditambahkan ke koleksi.',
      });
      closeForm();
    } else {
      setNotice({
        kind: 'error',
        message: 'Data belum berhasil disimpan. Periksa koneksi API lalu coba lagi.',
      });
    }

    return success;
  };

  const handleArchiveToggle = async (bean: Bean) => {
    if (typeof bean.id !== 'number') return;

    setProcessingId(bean.id);
    setOpenMenuId(null);

    const isArchived = Boolean(bean.archivedAt);
    const success = isArchived
      ? await restoreBean(bean.id)
      : await archiveBean(bean.id);

    setNotice(
      success
        ? {
            kind: 'success',
            message: isArchived
              ? `${bean.name} berhasil dikembalikan ke koleksi aktif.`
              : `${bean.name} berhasil diarsipkan.`,
          }
        : {
            kind: 'error',
            message: isArchived
              ? `Gagal mengembalikan ${bean.name}.`
              : `Gagal mengarsipkan ${bean.name}.`,
          },
    );

    setProcessingId(null);
  };

  const resetFilters = () => {
    setFilterRoast('');
    setFilterProcess('');
    setFilterOrigin('');
    setSearch('');
    setSortBy('recent');
  };

  const hasActiveFilters =
    Boolean(filterRoast || filterProcess || filterOrigin);

  return (
    <main className="page-wrap bean-library">
      <section className="bean-library-header" aria-labelledby="page-title">
        <div>
          <span className="section-kicker">YOUR COFFEE, YOUR STORY</span>
          <h1 id="page-title">
            Bean <em>Library.</em>
          </h1>
          <p className="intro-copy">
            Simpan biji kopi favoritmu dan bangun arsip perjalanan seduhmu.
          </p>
        </div>

        <div className="bean-library-count">
          <strong>{String(activeBeans.length).padStart(2, '0')}</strong>
          <span>ACTIVE<br />BEANS</span>
        </div>
      </section>

      {notice && (
        <div
          className={`notice notice-${notice.kind}`}
          role={notice.kind === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          <span>{notice.kind === 'success' ? '✓' : notice.kind === 'error' ? '!' : 'i'}</span>
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Tutup pemberitahuan"
          >
            ×
          </button>
        </div>
      )}

      <section className="bean-library-toolbar" aria-label="Kontrol koleksi">
        <div className="bean-library-tabs" role="tablist" aria-label="Status kopi">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'active'}
            className={activeTab === 'active' ? 'active' : ''}
            onClick={() => {
              setActiveTab('active');
              setOpenMenuId(null);
            }}
          >
            Active <span>{activeBeans.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'archived'}
            className={activeTab === 'archived' ? 'active' : ''}
            onClick={() => {
              setActiveTab('archived');
              setOpenMenuId(null);
            }}
          >
            Archived <span>{archivedBeans.length}</span>
          </button>
        </div>

        <div className="bean-library-controls">
          <label className="bean-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kopi atau roastery..."
              aria-label="Cari nama kopi atau roastery"
            />
          </label>

          <label className="bean-sort">
            <span className="visually-hidden">Urutkan koleksi</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
            >
              <option value="recent">Recently added</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              {hasRoastDate && (
                <option value="roast-date">Roast date</option>
              )}
            </select>
          </label>

          <button
            type="button"
            className={`bean-filter-toggle${showAdvanced ? ' active' : ''}`}
            onClick={() => setShowAdvanced((value) => !value)}
            aria-expanded={showAdvanced}
          >
            <span aria-hidden="true">☷</span>
            Filters
          </button>
        </div>
      </section>

      {showAdvanced && (
        <section className="bean-advanced-filters" aria-label="Advanced filters">
          <label>
            Roast level
            <select
              value={filterRoast}
              onChange={(event) => setFilterRoast(event.target.value)}
            >
              <option value="">All roast levels</option>
              {roastOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Process
            <select
              value={filterProcess}
              onChange={(event) => setFilterProcess(event.target.value)}
            >
              <option value="">All processes</option>
              {processOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label>
            Origin
            <select
              value={filterOrigin}
              onChange={(event) => setFilterOrigin(event.target.value)}
            >
              <option value="">All origins</option>
              {originOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

                    {hasActiveFilters && (
            <button type="button" onClick={resetFilters}>
              Reset filters
            </button>
          )}
        </section>
      )}

      <section className="bean-library-content" aria-label="Daftar kopi">
        <div className="bean-library-section-heading">
          <div>
            <span className="section-kicker">
              {activeTab === 'active' ? 'YOUR COLLECTION' : 'YOUR ARCHIVE'}
            </span>
            <h2>
              {activeTab === 'active' ? 'All beans' : 'Archived beans'}
              <span className="title-period">.</span>
            </h2>
          </div>
          <span className="bean-results-count">
            {filteredBeans.length} {filteredBeans.length === 1 ? 'BEAN' : 'BEANS'}
          </span>
        </div>

        {isLoading && (
          <div className="bean-library-state" role="status">
            <span className="state-loader" />
            <strong>Menyiapkan koleksi...</strong>
            <span>Mengambil data kopi kamu.</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="bean-library-state state-error" role="alert">
            <strong>Koleksi belum dapat dimuat</strong>
            <span>{error}</span>
            <button type="button" onClick={() => void fetchBeans()}>
              Coba muat ulang
            </button>
          </div>
        )}

        {!isLoading && !error && filteredBeans.length === 0 && (
          <div className="bean-library-empty">
            <span className="bean-empty-icon" aria-hidden="true">☕</span>
            <h3>
              {tabBeans.length === 0
                ? activeTab === 'active'
                  ? 'Your coffee story starts here.'
                  : 'Belum ada kopi yang diarsipkan.'
                : 'Tidak ada kopi yang cocok.'}
            </h3>
            <p>
              {tabBeans.length === 0
                ? activeTab === 'active'
                  ? 'Tambahkan kopi pertamamu untuk mulai membangun koleksi.'
                  : 'Kopi yang kamu arsipkan akan muncul di sini.'
                : 'Coba ubah kata pencarian atau filter yang digunakan.'}
            </p>
            {tabBeans.length > 0 && (
              <button type="button" onClick={resetFilters}>
                Reset pencarian dan filter
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && filteredBeans.length > 0 && (
          <div className="bean-library-grid">
            {filteredBeans.map((bean, index) => (
              <article
                className="library-bean-card"
                key={bean.id ?? `${bean.name}-${index}`}
              >
                <div className="library-bean-image">
                  <Link
                    className="library-bean-image-link"
                    to={`/beans/${bean.id}`}
                    aria-label={`Lihat detail ${bean.name}`}
                  >
                    {bean.photoBase64 ? (
                      <img
                        src={bean.photoBase64}
                        alt={`Kemasan ${bean.name}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="library-bean-image-fallback">
                        <span aria-hidden="true">☕</span>
                        <small>BROBEAN</small>
                      </div>
                    )}

                    {activeTab === 'archived' && (
                      <span className="library-archived-label">ARCHIVED</span>
                    )}

                    <span className="library-bean-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </Link>

                  <div className="library-bean-menu-wrap">
                    <button
                      type="button"
                      className="library-bean-menu-button"
                      aria-label={`Menu tindakan ${bean.name}`}
                      aria-expanded={openMenuId === bean.id}
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === bean.id ? null : bean.id ?? null,
                        )
                      }
                    >
                      •••
                    </button>

                    {openMenuId === bean.id && (
                      <div className="library-bean-menu">
                        <button
                          type="button"
                          onClick={() => openEditForm(bean)}
                        >
                          Edit bean
                        </button>
                        <button
                          type="button"
                          disabled={processingId === bean.id}
                          onClick={() => void handleArchiveToggle(bean)}
                        >
                          {processingId === bean.id
                            ? 'Processing...'
                            : activeTab === 'active'
                              ? 'Archive'
                              : 'Restore'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  className="library-bean-card-content library-bean-card-link"
                  to={`/beans/${bean.id}`}
                  aria-label={`Lihat detail ${bean.name}`}
                >
                  <h3 title={bean.name}>{bean.name}</h3>
                  <p>{bean.roastery}</p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="page-footer">
        <span>BREW SLOW. KEEP NOTES.</span>
        <span>BROBEAN © 2026</span>
      </footer>

      <button
        type="button"
        className="bean-library-fab"
        onClick={openAddForm}
        aria-label="Tambah kopi baru"
      >
        <span aria-hidden="true">+</span>
        <span>Add Bean</span>
      </button>

      {showForm && (
        <div
          className="bean-form-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            className="bean-form-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bean-dialog-title"
          >
            <div className="bean-form-dialog-header">
              <div>
                <span className="section-kicker">
                  {editingBean ? 'UPDATE YOUR COLLECTION' : 'EXPAND YOUR COLLECTION'}
                </span>
                <h2 id="bean-dialog-title">
                  {editingBean ? 'Edit bean.' : 'Add a bean.'}
                </h2>
              </div>

              <button
                type="button"
                className="bean-form-dialog-close"
                onClick={closeForm}
                aria-label="Tutup formulir"
              >
                ×
              </button>
            </div>

            <div className="bean-form-dialog-body">
              <BeanForm
                editingBean={editingBean}
                isSubmitLoading={isSubmitLoading}
                onSave={handleSaveBean}
                onCancelEdit={closeForm}
                onNotice={setNotice}
              />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
