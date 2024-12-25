import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Scan, LogEntry, ScanResults } from '../types/scan';
import { getScanById, getScanLogs, getScanResults } from '../api/scans';

export default function ScanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchScanDetails = async () => {
      try {
        const scanData = await getScanById(id);
        setScan(scanData);

        if (scanData.status === 'completed' || scanData.status === 'failed') {
          const scanResults = await getScanResults(id);
          setResults(scanResults);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scan details');
      }
    };

    const fetchLogs = async () => {
      try {
        const logsData = await getScanLogs(id);
        setLogs(logsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scan logs');
      }
    };

    const interval = setInterval(() => {
      if (scan?.status === 'in-progress') {
        fetchScanDetails();
        fetchLogs();
      }
    }, 2000);

    fetchScanDetails();
    fetchLogs();

    return () => clearInterval(interval);
  }, [id, scan?.status]);

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

  if (!scan) {
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
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Scan Details and Logs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-bold mb-4">Scan Details</h1>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Target:</p>
                  <p className="font-medium">{scan.target}</p>
                </div>
                <div>
                  <p className="text-gray-600">Method:</p>
                  <p className="font-medium">{scan.method}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <p className="font-medium">{scan.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Progress:</p>
                  <p className="font-medium">{scan.progress}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Logs</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      log.type === 'error'
                        ? 'bg-red-100 text-red-800'
                        : log.type === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : log.type === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Scan Results and Open Ports */}
          <div className="lg:col-span-2">
            {results && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Open Ports</h2>
                  <div className="text-gray-600">
                    Total Ports Scanned: {results.totalPorts}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {results.openPorts.map((port) => (
                    <div
                      key={port.number}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-gray-50"
                      onClick={() => navigate(`/ports/${scan.id}/${port.number}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">Port {port.number}</h3>
                          <p className="text-gray-600">{port.service}</p>
                          {port.version && (
                            <p className="text-sm text-gray-500">{port.version}</p>
                          )}
                        </div>
                        {port.vulnerabilities.length > 0 && (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                            {port.vulnerabilities.length} vulnerabilities
                          </span>
                        )}
                      </div>
                      {port.vulnerabilities.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600 mb-2">Top vulnerabilities:</p>
                          <ul className="space-y-1">
                            {port.vulnerabilities.slice(0, 2).map((vuln) => (
                              <li key={vuln.id} className="text-sm text-gray-800">
                                • {vuln.title}
                              </li>
                            ))}
                            {port.vulnerabilities.length > 2 && (
                              <li className="text-sm text-gray-500">
                                • and {port.vulnerabilities.length - 2} more...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 