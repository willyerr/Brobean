import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Bean } from '@brobean/shared';
import { beanRepository } from '../services/beanRepository';
import { useBeanStore } from '../store/useBeanStore';

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (value === undefined || value === '') return null;

  return (
    <div className="bean-detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatPrice(price?: number): string | undefined {
  if (price === undefined) return undefined;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;

  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function BeanDetail() {
  const { id } = useParams<{ id: string }>();
  const beanId = Number(id);
  const isValidId = Number.isInteger(beanId) && beanId > 0;
  const beans = useBeanStore((state) => state.beans);
  const beanFromStore = isValidId
    ? beans.find((item) => item.id === beanId)
    : undefined;

  const [fetchedBean, setFetchedBean] = useState<Bean | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidId || beanFromStore) return;

    let cancelled = false;
    setIsDetailLoading(true);
    setDetailError(null);
    setFetchedBean(null);

    beanRepository
      .getBeanById(beanId)
      .then((data) => {
        if (!cancelled) setFetchedBean(data);
      })
      .catch(() => {
        if (!cancelled) setDetailError('Data kopi tidak ditemukan atau API tidak dapat dihubungi.');
      })
      .finally(() => {
        if (!cancelled) setIsDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [beanId, isValidId, beanFromStore]);

  const bean = beanFromStore || (fetchedBean?.id === beanId ? fetchedBean : null);

  if (!isValidId) {
    return (
      <main className="page-wrap bean-detail-page">
        <Link to="/beans" className="bean-detail-back">← Back to Bean Library</Link>
        <section className="bean-detail-state">
          <span className="section-kicker">INVALID ADDRESS</span>
          <h1>That bean cannot be found.</h1>
          <p>ID kopi yang diminta tidak valid.</p>
        </section>
      </main>
    );
  }

  if (!bean && isDetailLoading) {
    return (
      <main className="page-wrap bean-detail-page">
        <Link to="/beans" className="bean-detail-back">← Back to Bean Library</Link>
        <section className="bean-detail-state" role="status" aria-live="polite">
          <span className="section-kicker">YOUR COFFEE COLLECTION</span>
          <h1>Loading bean details...</h1>
          <p>Sedang mengambil informasi kopi.</p>
        </section>
      </main>
    );
  }

  if (!bean) {
    return (
      <main className="page-wrap bean-detail-page">
        <Link to="/beans" className="bean-detail-back">← Back to Bean Library</Link>
        <section className="bean-detail-state">
          <span className="section-kicker">NOT FOUND</span>
          <h1>Bean not found.</h1>
          <p>{detailError || 'Data kopi tidak ditemukan.'}</p>
          <Link to="/beans" className="bean-detail-primary-link">Return to Bean Library</Link>
        </section>
      </main>
    );
  }

  const hasOrigin = Boolean(bean.originCountry || bean.originRegion || bean.originFarm);
  const hasCharacteristics = Boolean(
    bean.variety || bean.process || bean.roastLevel || bean.roastDate,
  );
  const hasPurchase = bean.bagWeightGrams !== undefined || bean.price !== undefined;

  return (
    <main className="page-wrap bean-detail-page">
      <Link to="/beans" className="bean-detail-back">← Back to Bean Library</Link>

      <section className="bean-detail-hero" aria-labelledby="bean-detail-title">
        <div className="bean-detail-photo">
          {bean.photoBase64 ? (
            <img src={bean.photoBase64} alt={`Kemasan ${bean.name}`} />
          ) : (
            <div className="bean-detail-photo-fallback">
              <span aria-hidden="true">☕</span>
              <small>BROBEAN</small>
            </div>
          )}
        </div>

        <div className="bean-detail-heading">
          <span className="section-kicker">YOUR COFFEE COLLECTION</span>
          <h1 id="bean-detail-title">{bean.name}<span className="title-period">.</span></h1>
          <p className="bean-detail-roastery">{bean.roastery}</p>
          {bean.archivedAt && (
            <span className="bean-detail-archived">ARCHIVED</span>
          )}
        </div>
      </section>

      {hasOrigin && (
        <section className="bean-detail-section" aria-labelledby="bean-origin-title">
          <span className="section-kicker">01 / ORIGIN</span>
          <h2 id="bean-origin-title">Where it comes from.</h2>
          <div className="bean-detail-grid">
            <DetailItem label="Country" value={bean.originCountry} />
            <DetailItem label="Region" value={bean.originRegion} />
            <DetailItem label="Farm" value={bean.originFarm} />
          </div>
        </section>
      )}

      {hasCharacteristics && (
        <section className="bean-detail-section" aria-labelledby="bean-characteristics-title">
          <span className="section-kicker">02 / CHARACTERISTICS</span>
          <h2 id="bean-characteristics-title">Getting to know the bean.</h2>
          <div className="bean-detail-grid">
            <DetailItem label="Variety" value={bean.variety} />
            <DetailItem label="Process" value={bean.process} />
            <DetailItem label="Roast level" value={bean.roastLevel} />
            <DetailItem label="Roast date" value={formatDate(bean.roastDate)} />
          </div>
        </section>
      )}

      {hasPurchase && (
        <section className="bean-detail-section" aria-labelledby="bean-purchase-title">
          <span className="section-kicker">03 / PURCHASE</span>
          <h2 id="bean-purchase-title">Purchase information.</h2>
          <div className="bean-detail-grid">
            <DetailItem
              label="Bag weight"
              value={bean.bagWeightGrams !== undefined ? `${bean.bagWeightGrams} g` : undefined}
            />
            <DetailItem label="Price" value={formatPrice(bean.price)} />
          </div>
        </section>
      )}

      {bean.notes && (
        <section className="bean-detail-section" aria-labelledby="bean-notes-title">
          <span className="section-kicker">04 / PERSONAL NOTES</span>
          <h2 id="bean-notes-title">Things to remember.</h2>
          <p className="bean-detail-notes">{bean.notes}</p>
        </section>
      )}

      <footer className="page-footer">
        <span>BREW SLOW. KEEP NOTES.</span>
        <span>BROBEAN © 2026</span>
      </footer>
    </main>
  );
}
