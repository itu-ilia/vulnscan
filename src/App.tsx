import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ScanDetailsPage from './pages/ScanDetailsPage';
import PortDetailsPage from './pages/PortDetailsPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/scans/:id" element={<ScanDetailsPage />} />
        <Route path="/ports/:scanId/:portNumber" element={<PortDetailsPage />} />
        <Route path="/reports/:id" element={<ReportsPage />} />
      </Routes>
    </Router>
  );
}
