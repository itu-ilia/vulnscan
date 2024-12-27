import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';

interface ExecutiveSummary {
  introduction: {
    targetSystem: string;
    totalPorts: number;
    toolsUsed: string[];
    scanDate: string;
  };
  keyFindings: {
    totalOpenPorts: number;
    criticalVulnerabilities: number;
    commonIssues: string[];
  };
  portAnalysis: Array<{
    portNumber: number;
    service: string;
    status: string;
    vulnerabilities: string;
    riskLevel: 'High' | 'Medium' | 'Low';
  }>;
  vulnerabilityAssessment: {
    findings: Array<{
      name: string;
      affectedService: string;
      description: string;
      impact: string;
      likelihood: 'High' | 'Medium' | 'Low';
    }>;
  };
  riskAssessment: {
    risks: Array<{
      category: string;
      description: string;
    }>;
    overallRisk: 'High' | 'Medium' | 'Low';
  };
  recommendations: {
    portManagement: string[];
    serviceHardening: string[];
    vulnerabilityMitigation: string[];
    monitoringAndResponse: string[];
  };
}

// Mock data for demonstration
const mockExecutiveSummary: ExecutiveSummary = {
  introduction: {
    targetSystem: 'example.com',
    totalPorts: 1000,
    toolsUsed: ['Nmap', 'Vulnerability Scanner'],
    scanDate: '2024-01-26 10:00:00',
  },
  keyFindings: {
    totalOpenPorts: 3,
    criticalVulnerabilities: 2,
    commonIssues: [
      'Outdated service versions',
      'Weak authentication mechanisms',
      'Misconfigured services',
    ],
  },
  portAnalysis: [
    {
      portNumber: 80,
      service: 'HTTP',
      status: 'Open',
      vulnerabilities: 'Apache 2.4.46 vulnerabilities',
      riskLevel: 'High',
    },
    {
      portNumber: 443,
      service: 'HTTPS',
      status: 'Open',
      vulnerabilities: 'TLS configuration issues',
      riskLevel: 'Medium',
    },
    {
      portNumber: 22,
      service: 'SSH',
      status: 'Open',
      vulnerabilities: 'None detected',
      riskLevel: 'Low',
    },
  ],
  vulnerabilityAssessment: {
    findings: [
      {
        name: 'CVE-2021-1234',
        affectedService: 'HTTP (Port 80)',
        description: 'Remote code execution vulnerability in Apache',
        impact: 'Potential system compromise',
        likelihood: 'High',
      },
      {
        name: 'CVE-2021-5678',
        affectedService: 'HTTPS (Port 443)',
        description: 'TLS misconfiguration',
        impact: 'Information disclosure',
        likelihood: 'Medium',
      },
    ],
  },
  riskAssessment: {
    risks: [
      {
        category: 'Data Breach',
        description: 'Exposure of sensitive information through vulnerable services',
      },
      {
        category: 'Service Disruption',
        description: 'Potential downtime affecting business operations',
      },
      {
        category: 'Unauthorized Access',
        description: 'System compromise through exposed vulnerabilities',
      },
    ],
    overallRisk: 'High',
  },
  recommendations: {
    portManagement: [
      'Close unnecessary ports',
      'Implement strict firewall rules',
    ],
    serviceHardening: [
      'Update Apache to version 2.4.50 or later',
      'Configure TLS settings according to best practices',
    ],
    vulnerabilityMitigation: [
      'Apply security patches regularly',
      'Implement strong authentication mechanisms',
    ],
    monitoringAndResponse: [
      'Set up intrusion detection systems',
      'Develop incident response procedures',
    ],
  },
};

const ExecutiveSummaryPage = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const summary = mockExecutiveSummary; // In real app, fetch based on scanId

  const handleExport = (format: 'pdf' | 'docx') => {
    alert(`Exporting executive summary as ${format.toUpperCase()}...`);
  };

  const getRiskBadgeColor = (risk: 'High' | 'Medium' | 'Low') => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-8">
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
            Executive Summary
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
            onClick={() => handleExport('docx')}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <FiDownload />
            <span>Export Word</span>
          </button>
        </div>
      </div>

      {/* Introduction */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
        <p className="text-gray-600">
          This report presents the findings from a comprehensive assessment of{' '}
          <span className="font-medium">{summary.introduction.targetSystem}</span>,
          focusing on the analysis of open ports and associated vulnerabilities.
          The assessment encompassed scanning {summary.introduction.totalPorts} ports
          using {summary.introduction.toolsUsed.join(', ')}.
        </p>
      </section>

      {/* Key Findings */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">2. Key Findings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {summary.keyFindings.totalOpenPorts}
            </div>
            <div className="text-sm text-blue-600">Open Ports</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-red-600">
              {summary.keyFindings.criticalVulnerabilities}
            </div>
            <div className="text-sm text-red-600">Critical Vulnerabilities</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {summary.portAnalysis.length}
            </div>
            <div className="text-sm text-yellow-600">Services Analyzed</div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Common Issues:</h3>
          <ul className="list-disc list-inside text-gray-600">
            {summary.keyFindings.commonIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Port Analysis */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">3. Port Analysis</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Port</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vulnerabilities</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.portAnalysis.map((port) => (
                <tr key={port.portNumber}>
                  <td className="px-6 py-4">{port.portNumber}</td>
                  <td className="px-6 py-4">{port.service}</td>
                  <td className="px-6 py-4">{port.status}</td>
                  <td className="px-6 py-4">{port.vulnerabilities}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeColor(port.riskLevel)}`}>
                      {port.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Vulnerability Assessment */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">4. Vulnerability Assessment</h2>
        <div className="space-y-4">
          {summary.vulnerabilityAssessment.findings.map((finding, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{finding.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeColor(finding.likelihood)}`}>
                  {finding.likelihood} Risk
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Affected Service:</span> {finding.affectedService}</p>
                <p><span className="font-medium">Description:</span> {finding.description}</p>
                <p><span className="font-medium">Impact:</span> {finding.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Risk Assessment */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">5. Risk Assessment</h2>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Overall Risk Level:</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor(summary.riskAssessment.overallRisk)}`}>
              {summary.riskAssessment.overallRisk}
            </span>
          </div>
          <div className="space-y-4">
            {summary.riskAssessment.risks.map((risk, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{risk.category}</h4>
                <p className="text-gray-600 mt-1">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">6. Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Port Management</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {summary.recommendations.portManagement.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Service Hardening</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {summary.recommendations.serviceHardening.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Vulnerability Mitigation</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {summary.recommendations.vulnerabilityMitigation.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Monitoring and Response</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {summary.recommendations.monitoringAndResponse.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExecutiveSummaryPage; 