import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Bean, Brew, Preparation, PreparationParameter } from '@brobean/shared';
import { brewRepository } from '../services/brewRepository';
import { useBeanStore } from '../store/useBeanStore';
import { useBrewStore } from '../store/useBrewStore';
import BrewForm from '../components/brew/BrewForm';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(date);
}

export default function BrewDetail() {
  const { id } = useParams<{ id: string }>();
  const brewId = Number(id);
  const navigate = useNavigate();
  const beans = useBeanStore((state) => state.beans);
  const fetchBeans = useBeanStore((state) => state.fetchBeans);
  const editBrew = useBrewStore((state) => state.editBrew);
  const removeBrew = useBrewStore((state) => state.removeBrew);
  const [brew, setBrew] = useState<Brew | null>(null);
  const [preparations, setPreparations] = useState<Preparation[]>([]);
  const [parameters, setParameters] = useState<PreparationParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchBeans();
    if (!Number.isInteger(brewId) || brewId <= 0) {
      setError('Alamat Brew Log tidak valid.');
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([brewRepository.getBrewById(brewId), brewRepository.getPreparations()])
      .then(([item, methods]) => {
        if (cancelled) return;
        setBrew(item);
        setPreparations(methods);
        return brewRepository.getPreparationParameters(item.preparationId).then((items) => {
          if (!cancelled) setParameters(items);
        });
      })
      .catch(() => { if (!cancelled) setError('Brew Log tidak ditemukan atau API tidak dapat dihubungi.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [brewId, fetchBeans]);

  const bean: Bean | undefined = beans.find((item) => item.id === brew?.beanId);
  const preparation = preparations.find((item) => item.id === brew?.preparationId);

  const handleSave = async (data: Omit<Brew, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!brew?.id) return null;
    const updated = await editBrew(brew.id, data);
    if (updated) {
      setBrew(updated);
      if (updated.preparationId !== brew.preparationId) {
        try { setParameters(await brewRepository.getPreparationParameters(updated.preparationId)); } catch { setParameters([]); }
      }
      setEditing(false);
    }
    return updated;
  };

  const handleDelete = async () => {
    if (!brew?.id || !window.confirm('Hapus Brew Log ini? Tindakan ini tidak dapat dibatalkan.')) return;
    if (await removeBrew(brew.id)) navigate('/brews');
  };

  if (loading) return <main className="page-wrap brew-detail-page"><p className="brew-detail-state">Loading Brew Log…</p></main>;
  if (!brew) return <main className="page-wrap brew-detail-page"><Link to="/brews" className="bean-detail-back">← Back to Brew Log</Link><section className="brew-detail-state"><h1>Brew not found.</h1><p>{error ?? 'Data seduhan tidak ditemukan.'}</p></section></main>;

  if (editing) return (
    <main className="page-wrap brew-detail-page">
      <Link to={`/brews/${brew.id}`} className="bean-detail-back" onClick={(event) => { event.preventDefault(); setEditing(false); }}>← Back to details</Link>
      <BrewForm beans={beans} preparations={preparations} initialBrew={brew} onSave={handleSave} onCancel={() => setEditing(false)} />
    </main>
  );

  return (
    <main className="page-wrap brew-detail-page">
      <Link to="/brews" className="bean-detail-back">← Back to Brew Log</Link>
      <section className="brew-detail-header">
        <div><span className="section-kicker">BREWING JOURNAL / ENTRY {String(brew.id).padStart(3, '0')}</span><h1>{preparation?.name ?? 'Brew'} <em>session.</em></h1><p>{bean?.name ?? 'Coffee bean'} · {bean?.roastery ?? 'Roastery unavailable'}</p><time>{formatDate(brew.brewedAt)}</time></div>
        <div className="brew-detail-actions"><button type="button" className="brew-cancel-button" onClick={() => setEditing(true)}>Edit entry</button><button type="button" className="brew-delete-button" onClick={handleDelete}>Delete</button></div>
      </section>
      <section className="brew-detail-rating"><span className="section-kicker">OVERALL RATING</span><strong>{'★'.repeat(brew.rating)}<i>{'★'.repeat(5 - brew.rating)}</i></strong><span>{brew.rating} out of 5</span></section>
      <section className="brew-detail-section"><span className="section-kicker">BREWING PARAMETERS</span><h2>The details.</h2>
        {parameters.filter((parameter) => parameter.is_enabled === 1 && brew.values?.[parameter.parameter_key] !== undefined).length ? (
          <div className="brew-detail-parameters">
            {(['before', 'during', 'after'] as const).map((phase) => {
              const items = parameters.filter((parameter) => parameter.is_enabled === 1 && parameter.preparation_phase === phase && brew.values?.[parameter.parameter_key] !== undefined);
              if (!items.length) return null;
              return <div className="brew-detail-phase" key={phase}><h3>{phase === 'before' ? 'Before Brewing' : phase === 'during' ? 'During Brewing' : 'After Brewing'}</h3><div className="bean-detail-grid">{items.map((parameter) => <div className="bean-detail-item" key={parameter.parameter_key}><span>{parameter.label}</span><strong>{Array.isArray(brew.values[parameter.parameter_key]) ? (brew.values[parameter.parameter_key] as string[]).join(', ') : String(brew.values[parameter.parameter_key])}{parameter.unit ? ` ${parameter.unit}` : ''}</strong></div>)}</div></div>;
            })}
          </div>
        ) : <p className="brew-detail-muted">No additional brewing parameters were recorded.</p>}
      </section>
      {brew.note ? <section className="brew-detail-section"><span className="section-kicker">TASTING NOTES</span><h2>Thoughts on this cup.</h2><p className="brew-detail-note">{brew.note}</p></section> : null}
    </main>
  );
}
