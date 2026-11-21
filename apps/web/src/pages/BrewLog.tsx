import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Brew, Preparation } from '@brobean/shared';
import { brewRepository } from '../services/brewRepository';
import { useBeanStore } from '../store/useBeanStore';
import { useBrewStore } from '../store/useBrewStore';
import BrewForm from '../components/brew/BrewForm';
import BrewCard from '../components/brew/BrewCard';

export default function BrewLog() {
  const beans = useBeanStore((state) => state.beans);
  const fetchBeans = useBeanStore((state) => state.fetchBeans);
  const { brews, isLoading, error, fetchBrews, addBrew, removeBrew } = useBrewStore();
  const [preparations, setPreparations] = useState<Preparation[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [preparationError, setPreparationError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    void fetchBrews();
    // Keep archived methods available as labels for historical Brew Log entries.
    brewRepository.getPreparations(true)
      .then(setPreparations)
      .catch(() => setPreparationError('Brewing methods gagal dimuat. Pastikan API berjalan.'));
  }, [fetchBrews]);

  useEffect(() => {
    if (!beans.length) void fetchBeans();
  }, [beans.length, fetchBeans]);

  const activePreparations = useMemo(
    () => preparations.filter((item) => !item.archived_at),
    [preparations],
  );

  const visibleBrews = useMemo(() => {
    if (filter === 'all') return brews;
    return brews.filter((brew) => String(brew.preparationId) === filter);
  }, [brews, filter]);

  const handleDelete = async (brew: Brew) => {
    if (!brew.id || !window.confirm('Hapus Brew Log ini? Tindakan ini tidak dapat dibatalkan.')) return;
    await removeBrew(brew.id);
  };

  const handleSave = async (data: Omit<Brew, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await addBrew(data);
    if (created) setIsFormOpen(false);
    return created;
  };

  return (
    <main className="page-wrap brew-page">
      <section className="brew-page-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR COFFEE JOURNAL</div>
          <h1>Brew <em>Log.</em></h1>
          <p>Every cup tells a story. Keep track of your brewing experiments and discover what makes your coffee better.</p>
        </div>
        <div className="brew-page-header-side">
          <span className="brew-total-number">{brews.length.toString().padStart(2, '0')}</span>
          <span className="brew-total-label">BREWS<br/>RECORDED</span>
        </div>
      </section>

      {isFormOpen ? (
        <BrewForm beans={beans} preparations={activePreparations} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
      ) : (
        <div className="brew-toolbar">
          <div><span className="section-kicker">YOUR HISTORY</span><h2>Recent brews</h2></div>
          <button type="button" className="brew-new-button" onClick={() => setIsFormOpen(true)}><span>＋</span> Log a brew</button>
        </div>
      )}

      {preparationError ? <div className="brew-inline-error" role="alert">{preparationError}</div> : null}
      {error ? <div className="brew-inline-error" role="alert">{error}</div> : null}

      {!isFormOpen ? (
        <>
          <div className="brew-list-controls">
            <span>{visibleBrews.length} {visibleBrews.length === 1 ? 'entry' : 'entries'}</span>
            <select aria-label="Filter by brewing method" value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">All methods</option>
              {preparations.map((item) => <option key={item.id} value={item.id}>{item.name}{item.archived_at ? ' (Archived)' : ''}</option>)}
            </select>
          </div>
          {isLoading ? <div className="brew-empty-state" role="status"><span className="brew-state-symbol">◌</span><h2>Loading your brews…</h2><p>Gathering your brewing history.</p></div> : visibleBrews.length ? (
            <div className="brew-card-grid">
              {visibleBrews.map((brew) => (
                <BrewCard key={brew.id} brew={brew} bean={beans.find((item) => item.id === brew.beanId)} preparation={preparations.find((item) => item.id === brew.preparationId)} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="brew-empty-state">
              <span className="brew-state-symbol">☕</span>
              <span className="section-kicker">A FRESH START</span>
              <h2>Your brewing story starts here.</h2>
              <p>Record your first cup to build a personal history of beans, methods, and brewing experiments.</p>
              <button type="button" className="brew-new-button" onClick={() => setIsFormOpen(true)}>＋ Record your first brew</button>
              {!beans.some((bean) => !bean.archivedAt) ? <p className="brew-empty-hint">You need an active coffee bean first. <Link to="/beans">Open Bean Library →</Link></p> : null}
            </div>
          )}
        </>
      ) : null}
    </main>
  );
}
