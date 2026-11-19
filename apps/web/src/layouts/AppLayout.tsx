
import { NavLink, Outlet } from 'react-router-dom';

const navigation = [
  { label: 'Home', path: '/', icon: '⌂', end: true },
  { label: 'Beans', path: '/beans', icon: '◉' },
  { label: 'Brews', path: '/brews', icon: '☕' },
  { label: 'More', path: '/more', icon: '•••' },
];

const moreNavigation = [
  { label: 'Equipment', path: '/equipment', icon: '⚙' },
  { label: 'Statistics', path: '/statistics', icon: '▥' },
  { label: 'Settings', path: '/settings', icon: '⚙' },
];

function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <NavLink className="sidebar-brand" to="/" aria-label="Brobean Home">
          <span className="brand-mark">b.</span>
          <span>
            brobean<span className="brand-period">.</span>
          </span>
        </NavLink>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`
              }
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-section-label more-label">
          MORE
        </div>

        <nav className="sidebar-nav" aria-label="Additional navigation">
          {moreNavigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`
              }
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          YOUR PERSONAL COFFEE JOURNAL
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `mobile-nav-link${isActive ? ' active' : ''}`
            }
          >
            <span className="mobile-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AppLayout;
