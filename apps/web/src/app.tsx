
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from 'react-router-dom';

import AppLayout from './layouts/AppLayout';
import BeanCatalog from './pages/BeanCatalog';
import Dashboard from './pages/Dashboard';

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="page-wrap">
      <section className="intro-block">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          BROBEAN WORKSPACE
        </div>
        <h1 id="page-title">{title}</h1>
        <p className="intro-copy">{description}</p>
      </section>
    </main>
  );
}

function MorePage() {
  return (
    <main className="page-wrap">
      <section className="intro-block">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          BROBEAN WORKSPACE
        </div>
        <h1 id="page-title">More.</h1>
        <p className="intro-copy">
          Explore additional tools and preferences.
        </p>
      </section>

      <div className="more-page-links">
        <Link to="/statistics">Statistics →</Link>
        <Link to="/settings">Settings →</Link>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
         <Route path="/" element={<Dashboard />} />

          <Route path="/beans" element={<BeanCatalog />} />

          <Route
            path="/brews"
            element={
              <PlaceholderPage
                title="Brew Log."
                description="Your brewing history will live here."
              />
            }
          />

          <Route
            path="/equipment"
            element={
              <PlaceholderPage
                title="Equipment."
                description="Manage your coffee brewing equipment here."
              />
            }
          />

          <Route
            path="/statistics"
            element={
              <PlaceholderPage
                title="Statistics."
                description="Your coffee insights will appear here."
              />
            }
          />

          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings."
                description="Manage your application preferences here."
              />
            }
          />

          <Route path="/more" element={<MorePage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
