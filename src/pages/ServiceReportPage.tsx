import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiFileText } from 'react-icons/fi';

export default function ServiceReportPage() {
  const { scanId, serviceId } = useParams<{ scanId: string; serviceId: string }>();

  // Mock service data
  const service = {
    id: serviceId,
    port: 80,
    name: 'HTTP',
    version: 'Apache 2.4.46',
    protocol: 'tcp',
    state: 'open',
    banner: 'Apache/2.4.46 (Unix) OpenSSL/1.1.1h',
    vulnerabilities: [
      {
        id: 'CVE-2021-1234',
        severity: 'High',
        title: 'Remote Code Execution in Apache',
        description: 'A vulnerability in Apache HTTP Server allows remote attackers to execute arbitrary code.',
        recommendation: 'Upgrade to Apache version 2.4.50 or later.',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-1234']
      },
      {
        id: 'CVE-2021-5678',
        severity: 'Medium',
        title: 'Information Disclosure',
        description: 'A vulnerability in Apache HTTP Server could allow an attacker to access sensitive information.',
        recommendation: 'Apply the latest security patches.',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-5678']
      }
    ]
  };

  const handleExport = () => {
    // Mock export functionality
    const report = {
      serviceId: service.id,
      port: service.port,
      name: service.name,
      version: service.version,
      protocol: service.protocol,
      state: service.state,
      banner: service.banner,
      vulnerabilities: service.vulnerabilities
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-report-${service.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            Service Report: {service.name} (Port {service.port})
          </h1>
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
            onClick={handleExport}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <FiDownload />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Service Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Version</label>
            <div className="mt-1 text-gray-900">{service.version}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Protocol</label>
            <div className="mt-1 text-gray-900">{service.protocol}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">State</label>
            <div className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {service.state}
              </span>
            </div>
          </div>
        </div>
        {service.banner && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500">Banner</label>
            <div className="mt-1 text-gray-900 font-mono text-sm bg-gray-50 p-3 rounded">
              {service.banner}
            </div>
          </div>
        )}
      </div>

      {/* Vulnerabilities */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Vulnerabilities
        </h2>
        <div className="space-y-4">
          {service.vulnerabilities.map((vuln) => (
            <div key={vuln.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{vuln.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-500">{vuln.id}</div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Description:</span> {vuln.description}</p>
                <p><span className="font-medium">Recommendation:</span> {vuln.recommendation}</p>
                <div>
                  <span className="font-medium">References:</span>
                  <ul className="list-disc list-inside mt-1">
                    {vuln.references.map((ref, index) => (
                      <li key={index}>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 