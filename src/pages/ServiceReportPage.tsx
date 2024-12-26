import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiShield, FiAlertTriangle } from 'react-icons/fi';

interface Vulnerability {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  recommendation: string;
}

interface ServiceDetails {
  port: number;
  service: string;
  version: string;
  protocol: string;
  state: string;
  banner: string;
  vulnerabilities: Vulnerability[];
}

// Mock data
const mockServiceDetails: ServiceDetails = {
  port: 80,
  service: 'HTTP',
  version: 'Apache/2.4.46',
  protocol: 'TCP',
  state: 'open',
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
};

const ServiceReportPage = () => {
  const { scanId, serviceId } = useParams<{ scanId: string; serviceId: string }>();
  // Mock data - in a real app, we would fetch based on scanId and serviceId
  const service = {
    ...mockServiceDetails,
    port: parseInt(serviceId || '80', 10), // Use the serviceId from URL params
  };

  const handleExport = (format: 'pdf' | 'json' | 'excel') => {
    // Mock export functionality
    alert(`Exporting ${service.port} report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/scans/${scanId}`}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft />
            <span>Back to Scan Details</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Port {service.port} ({service.service})
          </h1>
        </div>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Service Information
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Port</dt>
              <dd className="mt-1 text-sm text-gray-900">{service.port}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Service</dt>
              <dd className="mt-1 text-sm text-gray-900">{service.service}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Version</dt>
              <dd className="mt-1 text-sm text-gray-900">{service.version}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Protocol</dt>
              <dd className="mt-1 text-sm text-gray-900">{service.protocol}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">State</dt>
              <dd className="mt-1 text-sm text-gray-900">{service.state}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Banner</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                {service.banner}
              </dd>
            </div>
          </dl>
        </div>

        {/* Vulnerabilities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Potential Vulnerabilities
            </h2>
            <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              {service.vulnerabilities.length} Found
            </span>
          </div>
          <div className="space-y-4">
            {service.vulnerabilities.map((vuln) => (
              <div
                key={vuln.id}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {vuln.severity === 'High' && (
                      <FiAlertTriangle className="text-red-500" />
                    )}
                    {vuln.severity === 'Medium' && (
                      <FiAlertTriangle className="text-yellow-500" />
                    )}
                    {vuln.severity === 'Low' && (
                      <FiShield className="text-blue-500" />
                    )}
                    <h3 className="font-medium text-gray-900">{vuln.title}</h3>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      vuln.severity === 'High'
                        ? 'bg-red-100 text-red-800'
                        : vuln.severity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {vuln.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{vuln.description}</p>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Recommendation
                  </h4>
                  <p className="text-sm text-gray-600">{vuln.recommendation}</p>
                </div>
                <div className="pt-2">
                  <a
                    href={`https://nvd.nist.gov/vuln/detail/${vuln.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {vuln.id} - View in NVD Database →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceReportPage; 