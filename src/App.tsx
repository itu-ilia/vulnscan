import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ScanDetailsPage from './pages/ScanDetailsPage';
import ServiceReportPage from './pages/ServiceReportPage';
import ExecutiveSummaryPage from './pages/ExecutiveSummaryPage';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="scans/:scanId" element={<ScanDetailsPage />} />
          <Route
            path="scans/:scanId/services/:serviceId"
            element={<ServiceReportPage />}
          />
          <Route path="scans/:scanId/executive-summary" element={<ExecutiveSummaryPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
