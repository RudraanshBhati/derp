import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './components/PlaceholderPage';

import SimulatorPage from './pages/SimulatorPage';
import AdvisorPage from './pages/AdvisorPage';
import ModelLabPage from './pages/ModelLabPage';

// Import CSS
import './index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/advisor" element={<AdvisorPage />} />
          <Route path="/lab" element={<ModelLabPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
