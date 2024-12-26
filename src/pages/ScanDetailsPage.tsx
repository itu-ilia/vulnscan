import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Flow, LogEntry, ScanResults, LogType } from '../types/scan';
import { getScanById, getScanLogs, getScanResults } from '../api/scans';
import { Button } from 'antd';
import { ArrowLeftOutlined, FileSearchOutlined } from '@ant-design/icons';

export default function ScanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Flow | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLogTypes, setSelectedLogTypes] = useState<LogType[]>(['info', 'error', 'warning', 'success']);
  const [elapsedTime, setElapsedTime] = useState<string>('0:00');

  useEffect(() => {
    if (!scan?.startTime) return;

    const updateElapsedTime = () => {
      const start = new Date(scan.startTime).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - start) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateElapsedTime();
    const timer = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(timer);
  }, [scan?.startTime]);

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

  const filteredLogs = logs.filter(log => selectedLogTypes.includes(log.type));

  const getStatusIcon = () => {
    switch (scan?.status) {
      case 'completed':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      default:
        return <ClockIcon className="h-8 w-8 text-blue-500 animate-spin-slow" />;
    }
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
        <nav className="mb-6">
          <div className="flex space-x-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </Button>
            <Button 
              type="primary" 
              icon={<FileSearchOutlined />}
              onClick={() => navigate(`/scans/${id}/report`)}
              disabled={!scan || scan.status !== 'completed'}
            >
              View Report
            </Button>
          </div>
        </nav>

        {/* Header Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getStatusIcon()}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Scan {id?.slice(0, 8)}
                </h1>
                <p className="text-sm text-gray-500">Target: {scan.target}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Started {new Date(scan.startTime).toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-900">Elapsed: {elapsedTime}</div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${scan.progress}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  scan.status === 'failed' ? 'bg-red-500' : 'bg-primary-500'
                }`}
              ></div>
            </div>
            <div className="flex justify-between">
              <div className="text-center">
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  scan.progress >= 0 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  1
                </div>
                <div className="text-xs mt-1">Initialization</div>
              </div>
              <div className="text-center">
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  scan.progress >= 33 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  2
                </div>
                <div className="text-xs mt-1">Port Scanning</div>
              </div>
              <div className="text-center">
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  scan.progress >= 66 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  3
                </div>
                <div className="text-xs mt-1">Service Detection</div>
              </div>
              <div className="text-center">
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  scan.progress === 100 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  4
                </div>
                <div className="text-xs mt-1">Vulnerability Analysis</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Scan Details and Logs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Scan Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Target</p>
                  <p className="font-medium">{scan.target}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Method</p>
                  <p className="font-medium capitalize">{scan.method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    scan.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : scan.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : scan.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {scan.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="font-medium">{scan.progress}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Logs</h2>
                <div className="flex space-x-2">
                  {(['info', 'error', 'warning', 'success'] as LogType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedLogTypes(prev =>
                        prev.includes(type)
                          ? prev.filter(t => t !== type)
                          : [...prev, type]
                      )}
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedLogTypes.includes(type)
                          ? type === 'error'
                            ? 'bg-red-100 text-red-800'
                            : type === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      log.type === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : log.type === 'warning'
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                        : log.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-xs uppercase">{log.type}</span>
                    </div>
                    <p className="mt-1 text-sm">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Scan Results */}
          <div className="lg:col-span-2 space-y-6">
            {scan.status === 'completed' && scan.results && (
              <>
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Scan Results</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Open Ports</p>
                      <p className="text-2xl font-semibold">{scan.results.openPorts.filter(p => p.state === 'open').length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Vulnerabilities</p>
                      <p className="text-2xl font-semibold">{scan.results.statistics.totalIssues}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Critical Issues</p>
                      <p className="text-2xl font-semibold text-red-600">{scan.results.statistics.criticalIssues}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">High Risk Issues</p>
                      <p className="text-2xl font-semibold text-orange-600">{scan.results.statistics.highRiskIssues}</p>
                    </div>
                  </div>

                  <h3 className="text-md font-medium text-gray-900 mb-3">Open Ports & Services</h3>
                  <div className="space-y-3">
                    {scan.results.openPorts.filter(port => port.state === 'open').map((port) => (
                      <div key={port.number} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-medium">{port.number}</span>
                            <span className="text-gray-500">{port.protocol.toUpperCase()}</span>
                            {port.service && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
                                {port.service}
                              </span>
                            )}
                          </div>
                          {port.version && (
                            <span className="text-sm text-gray-500">Version: {port.version}</span>
                          )}
                        </div>
                        {port.vulnerabilities && port.vulnerabilities.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-1">Vulnerabilities: {port.vulnerabilities.length}</p>
                            <div className="flex space-x-2">
                              {port.vulnerabilities.map(vuln => (
                                <span
                                  key={vuln.id}
                                  className={`text-xs px-2 py-1 rounded ${
                                    vuln.severity === 'critical'
                                      ? 'bg-red-100 text-red-800'
                                      : vuln.severity === 'high'
                                      ? 'bg-orange-100 text-orange-800'
                                      : vuln.severity === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {vuln.severity.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Detailed Report</h2>
                    <Button 
                      type="primary" 
                      icon={<FileSearchOutlined />}
                      onClick={() => navigate(`/scans/${id}/report`)}
                    >
                      View Full Report
                    </Button>
                  </div>
                  <p className="text-gray-500">
                    View the complete vulnerability assessment report including detailed findings,
                    recommendations, and remediation steps.
                  </p>
                </div>
              </>
            )}

            {scan.status === 'in-progress' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <ClockIcon className="h-8 w-8 text-blue-500 animate-spin-slow mx-auto mb-2" />
                    <p className="text-gray-500">Scan in progress...</p>
                  </div>
                </div>
              </div>
            )}

            {scan.status === 'failed' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <XCircleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600">Scan failed</p>
                    {scan.error && <p className="text-gray-500 mt-1">{scan.error.message}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 