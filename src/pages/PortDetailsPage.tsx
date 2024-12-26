import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  BoltIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Scan, PortDetails } from '../types/scan';
import { getScanById, getScanResults } from '../api/scans';

export default function PortDetailsPage() {
  const { scanId, portNumber } = useParams<{ scanId: string; portNumber: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | null>(null);
  const [portDetails, setPortDetails] = useState<PortDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!scanId || !portNumber) return;

      try {
        const scanData = await getScanById(scanId);
        setScan(scanData);

        if (scanData.status === 'completed') {
          const results = await getScanResults(scanId);
          const port = results.openPorts.find(
            (p: PortDetails) => p.number === parseInt(portNumber, 10)
          );
          if (port) {
            setPortDetails(port);
          } else {
            setError('Port not found in scan results');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch port details');
      }
    };

    fetchData();
  }, [scanId, portNumber]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!scan || !portDetails) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/scans/${scanId}`)}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Scan
            </button>
            {scan.status === 'completed' && (
              <button
                onClick={() => navigate(`/reports/${scanId}`)}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View Report
              </button>
            )}
          </div>
        </nav>

        {/* Header Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Port {portDetails.number}
              </h1>
              <p className="text-sm text-gray-500">
                Service: {portDetails.service}
                {portDetails.version && ` (${portDetails.version})`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Target</div>
              <div className="text-sm font-medium text-gray-900">{scan.target}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Port Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Port Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Port Number</p>
                  <p className="font-medium">{portDetails.number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium">{portDetails.service}</p>
                </div>
                {portDetails.version && (
                  <div>
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-medium">{portDetails.version}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      portDetails.state === 'open'
                        ? 'bg-green-100 text-green-800'
                        : portDetails.state === 'filtered'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {portDetails.state}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Security Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldExclamationIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">Vulnerabilities</span>
                  </div>
                  <span className="text-sm font-medium">
                    {portDetails.vulnerabilities.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <LockClosedIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">Critical Issues</span>
                  </div>
                  <span className="text-sm font-medium">
                    {
                      portDetails.vulnerabilities.filter(
                        (v) => v.severity === 'critical'
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BoltIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-sm text-gray-600">High Risk</span>
                  </div>
                  <span className="text-sm font-medium">
                    {
                      portDetails.vulnerabilities.filter(
                        (v) => v.severity === 'high'
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Vulnerabilities */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Vulnerabilities</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {portDetails.vulnerabilities.map((vuln) => (
                  <div key={vuln.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {vuln.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                            vuln.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : vuln.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : vuln.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {vuln.severity}
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none text-gray-500 mb-4">
                      <p>{vuln.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Attack Vector
                        </h4>
                        <p className="text-sm text-gray-500">{vuln.attackVector}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Impact</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Confidentiality</span>
                            <span
                              className={`text-xs font-medium ${
                                vuln.impact.confidentiality === 'Critical'
                                  ? 'text-red-600'
                                  : vuln.impact.confidentiality === 'High'
                                  ? 'text-orange-600'
                                  : vuln.impact.confidentiality === 'Medium'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {vuln.impact.confidentiality}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Integrity</span>
                            <span
                              className={`text-xs font-medium ${
                                vuln.impact.integrity === 'Critical'
                                  ? 'text-red-600'
                                  : vuln.impact.integrity === 'High'
                                  ? 'text-orange-600'
                                  : vuln.impact.integrity === 'Medium'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {vuln.impact.integrity}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Availability</span>
                            <span
                              className={`text-xs font-medium ${
                                vuln.impact.availability === 'Critical'
                                  ? 'text-red-600'
                                  : vuln.impact.availability === 'High'
                                  ? 'text-orange-600'
                                  : vuln.impact.availability === 'Medium'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {vuln.impact.availability}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Mitigation Steps
                      </h4>
                      <p className="text-sm text-gray-500 mb-4">
                        {vuln.recommendation}
                      </p>

                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Best Practices
                      </h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {vuln.bestPractices.map((practice, index) => (
                          <li key={index} className="text-sm text-gray-500">
                            {practice}
                          </li>
                        ))}
                      </ul>

                      {vuln.references.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            References
                          </h4>
                          <ul className="space-y-1">
                            {vuln.references.map((ref, index) => (
                              <li key={index}>
                                <a
                                  href={ref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary-600 hover:text-primary-500"
                                >
                                  {ref}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 