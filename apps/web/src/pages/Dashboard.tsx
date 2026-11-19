import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBeanStore } from '../store/useBeanStore';

function Dashboard() {
  const beans = useBeanStore((state) => state.beans);
  const isLoading = useBeanStore((state) => state.isLoading);
  const error = useBeanStore((state) => state.error);
  const fetchBeans = useBeanStore((state) => state.fetchBeans);

  useEffect(() => {
    if (beans.length === 0) {
      void fetchBeans();
    }
  }, [beans.length, fetchBeans]);

  const recentBeans = [...beans]
    .sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;
      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return dateB - dateA;
    })
    .slice(0, 2);

  return (
    <main className="page-wrap dashboard-page">
      <section className="dashboard-heading">
        <p className="dashboard-greeting">YOUR COFFEE JOURNAL</p>
        <h1>Good coffee, good day.</h1>
        <p className="dashboard-subtitle">
          Your personal coffee journal.
        </p>
      </section>

      <section className="dashboard-stats" aria-label="Coffee summary">
        <div className="dashboard-stat">
          <span className="dashboard-stat-label">Beans</span>
          <strong className="dashboard-stat-value">
            {isLoading ? '—' : beans.length}
          </strong>
        </div>

        <div className="dashboard-stat">
          <span className="dashboard-stat-label">Brews</span>
          <strong className="dashboard-stat-value">—</strong>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Your collection</h2>
          <Link to="/beans">See all</Link>
        </div>

        {isLoading && beans.length === 0 ? (
          <p className="dashboard-message">Loading your collection...</p>
        ) : error && beans.length === 0 ? (
          <p className="dashboard-message dashboard-error">
            {error}
          </p>
        ) : recentBeans.length > 0 ? (
          <div className="dashboard-collection">
            {recentBeans.map((bean) => (
              <div className="dashboard-bean" key={bean.id ?? bean.name}>
                <div>
                  <h3>{bean.name}</h3>
                  <p>{bean.roastery}</p>
                </div>
                {bean.roastLevel && (
                  <span className="dashboard-bean-detail">
                    {bean.roastLevel}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <p>Your collection is waiting.</p>
            <Link to="/beans">Add your first bean</Link>
          </div>
        )}
      </section>

      <section className="dashboard-section dashboard-quick-section">
        <h2>Quick access</h2>

        <div className="dashboard-quick-actions">
          <Link to="/beans" className="dashboard-quick-action">
            <span className="dashboard-quick-icon">+</span>
            <span>Add bean</span>
          </Link>

          <Link to="/brews" className="dashboard-quick-action">
            <span className="dashboard-quick-icon">
  <svg
    className="dashboard-coffee-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M4 8h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" />
    <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
    <path d="M8 4c0 1 1 1 1 2M12 4c0 1 1 1 1 2" />
  </svg>
</span>
            <span>Log brew</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;


