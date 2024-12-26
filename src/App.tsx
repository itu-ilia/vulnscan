import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ScanDetailsPage from './pages/ScanDetailsPage';
import PortDetailsPage from './pages/PortDetailsPage';
import ViewReportPage from './pages/ViewReportPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/scans/:id" element={<ScanDetailsPage />} />
        <Route path="/ports/:scanId/:portNumber" element={<PortDetailsPage />} />
        <Route path="/scans/:id/report" element={<ViewReportPage />} />
      </Routes>
    </div>
  );
}
