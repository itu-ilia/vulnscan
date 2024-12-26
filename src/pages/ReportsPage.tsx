import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ChartPieIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Scan, ScanResults, PortDetails, Vulnerability } from '../types/scan';
import { getScanById, getScanResults } from '../api/scans';

type SeverityCount = {
  critical: number;
  high: number;
  medium: number;
  low: number;
};

type ProtocolCount = {
  [key: string]: number;
};

export default function ReportsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | null>(null);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [severityCounts, setSeverityCounts] = useState<SeverityCount>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [protocolCounts, setProtocolCounts] = useState<ProtocolCount>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const scanData = await getScanById(id);
        setScan(scanData);

        if (scanData.status === 'completed') {
          const scanResults = await getScanResults(id);
          setResults(scanResults);

          // Calculate severity counts
          const counts: SeverityCount = { critical: 0, high: 0, medium: 0, low: 0 };
          const protocols: ProtocolCount = {};

          scanResults.openPorts.forEach((port: PortDetails) => {
            // Count protocols
            const protocol = port.service.split('/')[0];
            protocols[protocol] = (protocols[protocol] || 0) + 1;

            // Count vulnerabilities by severity
            port.vulnerabilities.forEach((vuln: Vulnerability) => {
              counts[vuln.severity.toLowerCase() as keyof SeverityCount]++;
            });
          });

          setSeverityCounts(counts);
          setProtocolCounts(protocols);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scan data');
      }
    };

    fetchData();
  }, [id]);

  const handleExport = (format: 'pdf' | 'json' | 'excel') => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6">
          <button
            onClick={() => navigate(`/scans/${id}`)}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Scan
          </button>
        </nav>

        {/* Header Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Scan Report: {scan.target}
              </h1>
              <p className="text-sm text-gray-500">
                Completed on {new Date(scan.endTime!).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export PDF
              </button>
              <button
                onClick={() => handleExport('json')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export JSON
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Severity Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ChartPieIcon className="h-6 w-6 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Vulnerability Distribution</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(severityCounts).map(([severity, count]) => (
                <div key={severity}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="capitalize">{severity}</span>
                    <span>{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        severity === 'critical'
                          ? 'bg-red-500'
                          : severity === 'high'
                          ? 'bg-orange-500'
                          : severity === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${
                          Object.values(severityCounts).reduce((a, b) => a + b, 0)
                            ? (count /
                                Object.values(severityCounts).reduce(
                                  (a, b) => a + b,
                                  0
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Protocol Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-6 w-6 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Protocol Distribution</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(protocolCounts).map(([protocol, count]) => (
                <div key={protocol}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="uppercase">{protocol}</span>
                    <span>{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary-500"
                      style={{
                        width: `${
                          Object.values(protocolCounts).reduce((a, b) => a + b, 0)
                            ? (count /
                                Object.values(protocolCounts).reduce(
                                  (a, b) => a + b,
                                  0
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Findings Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Detailed Findings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Port
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protocol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vulnerabilities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mitigation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.openPorts.map((port) => (
                  port.vulnerabilities.map((vuln, index) => (
                    <tr key={`${port.number}-${vuln.id}`}>
                      {index === 0 && (
                        <>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                            rowSpan={port.vulnerabilities.length}
                          >
                            {port.number}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            rowSpan={port.vulnerabilities.length}
                          >
                            {port.service.split('/')[0]}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            rowSpan={port.vulnerabilities.length}
                          >
                            {port.service}
                            {port.version && (
                              <span className="text-xs text-gray-400 block">
                                {port.version}
                              </span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {vuln.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {vuln.recommendation}
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 