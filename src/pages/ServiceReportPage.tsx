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
    introduction: {
      scope: 'Web service assessment',
      tools: ['Nmap', 'Nikto', 'Custom scripts'],
      assumptions: ['Service is publicly accessible', 'No authentication required'],
      limitations: ['No destructive testing performed', 'Limited to HTTP methods']
    },
    connection: {
      description: 'HTTP web service running on standard port 80',
      accessControls: 'No IP restrictions or authentication mechanisms detected',
      observations: ['Default Apache configuration detected', 'Directory listing enabled']
    },
    enumeration: {
      resources: [
        'Default Apache welcome page',
        '/admin directory (403 Forbidden)',
        '/images directory (listing enabled)'
      ],
      configurations: [
        'mod_status enabled',
        'ETags exposed',
        'Server version disclosed in headers'
      ],
      anomalies: [
        'Directory listing enabled on /images',
        'Server version exposed in headers'
      ]
    },
    attackVectors: [
      {
        name: 'Information Disclosure',
        description: 'Server version and configuration details are exposed through headers and error pages',
        impact: 'Allows attackers to identify specific vulnerabilities',
        likelihood: 'High',
        mitigation: 'Configure security headers and disable version disclosure'
      },
      {
        name: 'Directory Traversal',
        description: 'Directory listing enabled on certain paths',
        impact: 'Potential exposure of sensitive files',
        likelihood: 'Medium',
        mitigation: 'Disable directory listing and implement proper access controls'
      }
    ],
    postExploitation: {
      access: ['Read access to public directories', 'Error pages with system information'],
      escalation: ['Potential for path traversal attacks', 'Version-specific vulnerabilities'],
      persistence: ['Limited options due to read-only access'],
      dataExfiltration: ['Public files and directory listings accessible']
    },
    reconnaissance: {
      additionalServices: ['Possible internal services through proxy configs'],
      architecture: ['Standard Apache installation with default modules'],
      opportunities: ['Further enumeration of exposed directories', 'Version-specific exploit research']
    },
    recommendations: [
      {
        category: 'Security Headers',
        items: [
          'Implement security headers (HSTS, X-Frame-Options)',
          'Remove version disclosure from headers',
          'Enable security-related Apache modules'
        ]
      },
      {
        category: 'Access Controls',
        items: [
          'Disable directory listing globally',
          'Implement IP-based access restrictions',
          'Configure proper authentication for sensitive areas'
        ]
      },
      {
        category: 'Monitoring',
        items: [
          'Implement web application firewall',
          'Enable detailed logging',
          'Set up alerts for suspicious activities'
        ]
      }
    ],
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
    const blob = new Blob([JSON.stringify(service, null, 2)], { type: 'application/json' });
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

      {/* Introduction */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Service Information</h3>
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
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Assessment Scope</h3>
            <p className="text-gray-600">{service.introduction.scope}</p>
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-900">Tools Used</h4>
              <ul className="mt-1 list-disc list-inside text-gray-600">
                {service.introduction.tools.map((tool, index) => (
                  <li key={index}>{tool}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Assumptions</h4>
              <ul className="mt-1 list-disc list-inside text-gray-600">
                {service.introduction.assumptions.map((assumption, index) => (
                  <li key={index}>{assumption}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Limitations</h4>
              <ul className="mt-1 list-disc list-inside text-gray-600">
                {service.introduction.limitations.map((limitation, index) => (
                  <li key={index}>{limitation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Connection */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">2. Connection</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Service Description</h3>
            <p className="text-gray-600">{service.connection.description}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Access Controls</h3>
            <p className="text-gray-600">{service.connection.accessControls}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Observations</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.connection.observations.map((observation, index) => (
                <li key={index}>{observation}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Enumeration */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">3. Enumeration</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Discovered Resources</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.enumeration.resources.map((resource, index) => (
                <li key={index}>{resource}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Service Configurations</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.enumeration.configurations.map((config, index) => (
                <li key={index}>{config}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Anomalies</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.enumeration.anomalies.map((anomaly, index) => (
                <li key={index}>{anomaly}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Attack Vector Analysis */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">4. Attack Vector Analysis</h2>
        <div className="space-y-4">
          {service.attackVectors.map((vector, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{vector.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(vector.likelihood)}`}>
                  {vector.likelihood} Likelihood
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Description:</span> {vector.description}</p>
                <p><span className="font-medium">Impact:</span> {vector.impact}</p>
                <p><span className="font-medium">Mitigation:</span> {vector.mitigation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Post-Exploitation */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">5. Post-Exploitation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Access Gained</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.postExploitation.access.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Privilege Escalation</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.postExploitation.escalation.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Persistence</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.postExploitation.persistence.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Data Exfiltration</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.postExploitation.dataExfiltration.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reconnaissance */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">6. Reconnaissance</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Additional Services</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.reconnaissance.additionalServices.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Architecture Insights</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.reconnaissance.architecture.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Further Opportunities</h3>
            <ul className="list-disc list-inside text-gray-600">
              {service.reconnaissance.opportunities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">7. Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {service.recommendations.map((category, index) => (
            <div key={index}>
              <h3 className="font-medium text-gray-900 mb-2">{category.category}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Vulnerabilities */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">8. Identified Vulnerabilities</h2>
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
      </section>
    </div>
  );
} 