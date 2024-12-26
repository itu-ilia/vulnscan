import { useParams, Link } from 'react-router-dom';
import { FiClock, FiCheck, FiAlertTriangle, FiArrowLeft, FiDownload } from 'react-icons/fi';

interface Vulnerability {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  recommendation: string;
}

interface PortDetails {
  number: number;
  service: string;
  state: string;
  version?: string;
  protocol?: string;
  banner?: string;
  vulnerabilities?: Vulnerability[];
}

interface ScanLog {
  timestamp: string;
  message: string;
}

// Mock data with extended port details
const mockScanDetails = {
  id: '1',
  target: 'example.com',
  method: 'Normal',
  status: 'In Progress',
  startTime: '2024-01-26 10:00:00',
  progress: 60,
  logs: [
    { timestamp: '10:00:00', message: 'Starting scan...' },
    { timestamp: '10:00:05', message: 'Checking DNS records...' },
    { timestamp: '10:00:10', message: 'Found DNS records: A, MX, TXT' },
    { timestamp: '10:00:15', message: 'Starting port scan (1-1000)...' },
    { timestamp: '10:00:20', message: 'Found open port: 80 (HTTP)' },
    { timestamp: '10:00:25', message: 'Found open port: 443 (HTTPS)' },
    { timestamp: '10:00:30', message: 'Starting service enumeration...' },
  ] as ScanLog[],
  ports: [
    {
      number: 80,
      service: 'HTTP',
      state: 'open',
      version: 'Apache/2.4.46',
      protocol: 'TCP',
      banner: 'Apache/2.4.46 (Unix) OpenSSL/1.1.1d',
      vulnerabilities: [
        {
          id: 'CVE-2021-1234',
          severity: 'High',
          title: 'Apache HTTP Server 2.4.46 Remote Code Execution',
          description:
            'A remote code execution vulnerability exists in Apache HTTP Server 2.4.46 that could allow remote attackers to execute arbitrary code on affected installations.',
          recommendation:
            'Upgrade to Apache HTTP Server 2.4.50 or later version. If upgrading is not immediately possible, apply the available security patches.',
        },
        {
          id: 'CVE-2021-5678',
          severity: 'Medium',
          title: 'Information Disclosure Vulnerability',
          description:
            'An information disclosure vulnerability exists that could allow an attacker to view sensitive information.',
          recommendation: 'Configure the server to hide version information in HTTP headers.',
        },
      ],
    },
    {
      number: 443,
      service: 'HTTPS',
      state: 'open',
      version: 'nginx/1.18.0',
      protocol: 'TCP',
      banner: 'nginx/1.18.0',
      vulnerabilities: [
        {
          id: 'CVE-2021-9999',
          severity: 'Medium',
          title: 'TLS Configuration Issue',
          description: 'Server supports outdated TLS protocols that may be vulnerable to attacks.',
          recommendation: 'Disable TLS 1.0 and 1.1, enable only TLS 1.2 and above.',
        },
      ],
    },
    {
      number: 22,
      service: 'SSH',
      state: 'filtered',
      version: 'OpenSSH 8.2p1',
      protocol: 'TCP',
      banner: 'SSH-2.0-OpenSSH_8.2p1',
      vulnerabilities: [],
    },
  ] as PortDetails[],
};

const ScanDetailsPage = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const scan = mockScanDetails;

  const handleExport = (format: 'pdf' | 'json' | 'excel') => {
    // Mock export functionality
    const report = {
      scanInfo: {
        id: scan.id,
        target: scan.target,
        method: scan.method,
        status: scan.status,
        startTime: scan.startTime,
        progress: scan.progress,
      },
      summary: {
        totalPorts: scan.ports.length,
        openPorts: scan.ports.filter(p => p.state === 'open').length,
        filteredPorts: scan.ports.filter(p => p.state === 'filtered').length,
        totalVulnerabilities: scan.ports.reduce(
          (sum, port) => sum + (port.vulnerabilities?.length || 0),
          0
        ),
        vulnerabilitiesBySeverity: {
          high: scan.ports.reduce(
            (sum, port) =>
              sum +
              (port.vulnerabilities?.filter(v => v.severity === 'High').length || 0),
            0
          ),
          medium: scan.ports.reduce(
            (sum, port) =>
              sum +
              (port.vulnerabilities?.filter(v => v.severity === 'Medium').length || 0),
            0
          ),
          low: scan.ports.reduce(
            (sum, port) =>
              sum +
              (port.vulnerabilities?.filter(v => v.severity === 'Low').length || 0),
            0
          ),
        },
      },
      timeline: scan.logs,
      discoveredServices: scan.ports.map(port => ({
        port: port.number,
        service: port.service,
        state: port.state,
        version: port.version,
        protocol: port.protocol,
        banner: port.banner,
        vulnerabilities: port.vulnerabilities?.map(vuln => ({
          id: vuln.id,
          severity: vuln.severity,
          title: vuln.title,
          description: vuln.description,
          recommendation: vuln.recommendation,
          references: `https://nvd.nist.gov/vuln/detail/${vuln.id}`,
        })),
      })),
    };

    // In a real app, this would generate and download a file
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-report-${scan.id}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Scan Details: {scan.target}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
              scan.status === 'Completed'
                ? 'bg-green-100 text-green-800'
                : scan.status === 'In Progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {scan.status === 'Completed' && <FiCheck className="w-4 h-4" />}
            {scan.status === 'In Progress' && <FiClock className="w-4 h-4" />}
            {scan.status === 'Failed' && <FiAlertTriangle className="w-4 h-4" />}
            <span>{scan.status}</span>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('pdf')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FiDownload />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FiDownload />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FiDownload />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar (if in progress) */}
      {scan.status === 'In Progress' && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {scan.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${scan.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logs Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scan Logs</h2>
          <div className="space-y-3">
            {scan.logs.map((log, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 text-sm"
              >
                <span className="text-gray-500">{log.timestamp}</span>
                <span className="text-gray-700">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ports Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Discovered Ports
          </h2>
          <div className="space-y-3">
            {scan.ports.map((port) => (
              <Link
                key={port.number}
                to={`/scans/${scanId}/services/${port.number}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Port {port.number}</span>
                    <span className="ml-2 text-gray-500">{port.service}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      port.state === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {port.state}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanDetailsPage; 