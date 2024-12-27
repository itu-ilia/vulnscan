import { useParams, Link } from 'react-router-dom';
import { FiDownload, FiFileText, FiArrowLeft } from 'react-icons/fi';

export default function ScanDetailsPage() {
  const { scanId } = useParams<{ scanId: string }>();

  // Mock scan data
  const scan = {
    id: scanId,
    target: 'example.com',
    method: 'Normal',
    status: 'Completed',
    startTime: '2024-01-26 10:00:00',
    progress: 100,
    logs: [
      { timestamp: '2024-01-26 10:00:00', message: 'Scan started' },
      { timestamp: '2024-01-26 10:01:00', message: 'Port scanning in progress' },
      { timestamp: '2024-01-26 10:02:00', message: 'Service detection started' },
      { timestamp: '2024-01-26 10:03:00', message: 'Vulnerability analysis in progress' },
      { timestamp: '2024-01-26 10:04:00', message: 'Scan completed' }
    ],
    services: [
      { id: '1', port: 80, name: 'HTTP', version: 'Apache 2.4.46' },
      { id: '2', port: 443, name: 'HTTPS', version: 'nginx 1.18.0' },
      { id: '3', port: 22, name: 'SSH', version: 'OpenSSH 8.2p1' }
    ]
  };

  const handleExport = (format: string) => {
    // Mock export functionality
    const report = {
      scanId: scan.id,
      target: scan.target,
      method: scan.method,
      startTime: scan.startTime,
      services: scan.services,
      logs: scan.logs
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-report-${scan.id}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <FiArrowLeft />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Scan Details</h1>
          <p className="text-gray-500">Target: {scan.target}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/scans/${scanId}/executive-summary`}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FiFileText />
            <span>View Executive Summary</span>
          </Link>
          <button
            onClick={() => handleExport('json')}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <FiDownload />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Scan Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {scan.status}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Method</label>
            <div className="mt-1 text-gray-900">{scan.method}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Start Time</label>
            <div className="mt-1 text-gray-900">{scan.startTime}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Progress</label>
            <div className="mt-1 text-gray-900">{scan.progress}%</div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Discovered Services</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Port</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scan.services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4">{service.port}</td>
                  <td className="px-6 py-4">{service.name}</td>
                  <td className="px-6 py-4">{service.version}</td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/scans/${scanId}/service/${service.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Scan Logs</h2>
        <div className="space-y-4">
          {scan.logs.map((log, index) => (
            <div key={index} className="flex space-x-4 text-sm">
              <div className="text-gray-500">{log.timestamp}</div>
              <div className="text-gray-900">{log.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 