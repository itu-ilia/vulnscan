import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flow, ScanResults } from '../types/scan';
import { getScanById, getScanResults } from '../api/scans';
import { Button } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';

export default function ViewReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Flow | null>(null);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [scanData, resultsData] = await Promise.all([
          getScanById(id),
          getScanResults(id)
        ]);
        setScan(scanData);
        setResults(resultsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch report data');
      }
    };

    fetchData();
  }, [id]);

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

  if (!scan || !results) {
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

  const scanDuration = scan.endTime 
    ? Math.round((new Date(scan.endTime).getTime() - new Date(scan.startTime).getTime()) / 1000)
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <nav className="flex justify-between items-center">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(`/scans/${id}`)}
          >
            Back to Scan Details
          </Button>
          <Button 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => window.print()}
          >
            Export Report
          </Button>
        </nav>

        {/* Scan Identification */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Scan Report</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Flow ID</p>
              <p className="font-medium">{scan.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Target</p>
              <p className="font-medium">{scan.target}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                scan.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : scan.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {scan.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{scanDuration} seconds</p>
            </div>
          </div>
        </div>

        {/* Summary & Metrics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Summary & Metrics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total Open Ports</p>
              <p className="text-2xl font-bold text-blue-900">{results.openPorts.length}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">Total Vulnerabilities</p>
              <p className="text-2xl font-bold text-red-900">
                {results.openPorts.reduce((acc, port) => acc + port.vulnerabilities.length, 0)}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600">Total Ports Scanned</p>
              <p className="text-2xl font-bold text-yellow-900">{results.totalPorts}</p>
            </div>
          </div>
        </div>

        {/* Open Ports & Services */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Open Ports & Services</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Port
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protocol
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vulnerabilities
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.openPorts.map((port) => (
                  <tr key={port.number} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {port.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {port.protocol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {port.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {port.version || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {port.vulnerabilities.length > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {port.vulnerabilities.length} found
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          None
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Vulnerabilities */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Detailed Vulnerabilities</h2>
          <div className="space-y-6">
            {results.openPorts.map((port) => (
              port.vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{vuln.title}</h3>
                      <p className="text-sm text-gray-500">Port {port.number} ({port.service})</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vuln.severity === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : vuln.severity === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : vuln.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {vuln.severity}
                    </span>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Description</h4>
                      <p className="mt-1 text-sm text-gray-600">{vuln.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Impact</h4>
                      <div className="mt-2 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Confidentiality</p>
                          <p className="text-sm font-medium">{vuln.impact.confidentiality}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Integrity</p>
                          <p className="text-sm font-medium">{vuln.impact.integrity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Availability</p>
                          <p className="text-sm font-medium">{vuln.impact.availability}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Recommendation</h4>
                      <p className="mt-1 text-sm text-gray-600">{vuln.recommendation}</p>
                    </div>
                    {vuln.references.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">References</h4>
                        <ul className="mt-1 space-y-1">
                          {vuln.references.map((ref, index) => (
                            <li key={index} className="text-sm text-blue-600 hover:underline">
                              <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ))}
            {results.openPorts.every(port => port.vulnerabilities.length === 0) && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">No vulnerabilities found</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes & Configuration */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notes & Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Scan Method</p>
              <p className="font-medium capitalize">{scan.method}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Time</p>
              <p className="font-medium">{new Date(scan.startTime).toLocaleString()}</p>
            </div>
            {scan.endTime && (
              <div>
                <p className="text-sm text-gray-500">End Time</p>
                <p className="font-medium">{new Date(scan.endTime).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Report Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Report generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
} 