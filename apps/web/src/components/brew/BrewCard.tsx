import { Link } from 'react-router-dom';
import type { Bean, Brew, Preparation } from '@brobean/shared';

interface Props {
  brew: Brew;
  bean?: Bean;
  preparation?: Preparation;
  onDelete: (brew: Brew) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function parameterSummary(brew: Brew): string[] {
  const values = brew.values ?? {};
  const candidates = [
    ['grind_weight', 'g'],
    ['brew_temperature', '°C'],
    ['brew_quantity', 'g'],
    ['brew_beverage_quantity', 'g'],
  ] as const;
  return candidates.flatMap(([key, unit]) => {
    const value = values[key];
    return value !== undefined && value !== '' ? [`${String(value)} ${unit}`] : [];
  }).slice(0, 3);
}

export default function BrewCard({ brew, bean, preparation, onDelete }: Props) {
  const summary = parameterSummary(brew);
  return (
    <article className="brew-card">
      <div className="brew-card-topline">
        <span className="brew-card-method">{preparation?.name ?? 'Brewing method'}</span>
        <time>{formatDate(brew.brewedAt)}</time>
      </div>
      <Link to={`/brews/${brew.id}`} className="brew-card-main">
        <div className="brew-card-title-row">
          <div><h3>{bean?.name ?? 'Coffee bean'}</h3><p>{bean?.roastery ?? 'Bean details unavailable'}</p></div>
          <span className="brew-card-arrow" aria-hidden="true">↗</span>
        </div>
        <div className="brew-card-rating" aria-label={`Rating ${brew.rating} out of 5`}>
          <span>{'★'.repeat(brew.rating)}<i>{'★'.repeat(5 - brew.rating)}</i></span>
          <small>{brew.rating}/5</small>
        </div>
        {summary.length ? <div className="brew-card-summary">{summary.map((item) => <span key={item}>{item}</span>)}</div> : <p className="brew-card-no-summary">No brewing parameters recorded.</p>}
        {brew.note ? <p className="brew-card-note">“{brew.note}”</p> : null}
      </Link>
      <div className="brew-card-footer">
        <Link to={`/brews/${brew.id}`}>View brew details</Link>
        <button type="button" onClick={() => onDelete(brew)} aria-label={`Delete Brew Log ${brew.id}`}>Delete</button>
      </div>
    </article>
  );
}
