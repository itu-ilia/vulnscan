import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartBarIcon, ShieldExclamationIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getAllScans } from '../api/scans';
import { Scan } from '../types/scan';
import NewScanForm from '../components/NewScanForm';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [isNewScanModalOpen, setIsNewScanModalOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    openIssues: 0,
    successRate: 0
  });

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const scansData = await getAllScans();
        setScans(scansData);
        
        // Calculate metrics
        const totalScans = scansData.length;
        const completedScans = scansData.filter(scan => scan.status === 'completed').length;
        const openIssues = scansData.reduce((total, scan) => {
          return total + (scan.results?.openPorts.reduce((vulns, port) => 
            vulns + port.vulnerabilities.length, 0) || 0);
        }, 0);
        const successRate = totalScans ? (completedScans / totalScans) * 100 : 0;

        setMetrics({
          totalScans,
          openIssues,
          successRate
        });
      } catch (error) {
        console.error('Failed to fetch scans:', error);
      }
    };

    fetchScans();
    const interval = setInterval(fetchScans, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Quick Actions */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vulnerability Scanner</h1>
          <button
            onClick={() => setIsNewScanModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Start New Scan
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          {/* Total Scans */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Scans</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{metrics.totalScans}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Open Issues */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldExclamationIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Open Issues</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{metrics.openIssues}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {metrics.successRate.toFixed(1)}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Flows Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Active Scans</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scans.map((scan) => (
                    <tr
                      key={scan.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/scans/${scan.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {scan.target}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            scan.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : scan.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : scan.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(scan.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-primary-600 h-2.5 rounded-full"
                            style={{ width: `${scan.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs mt-1">{scan.progress}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/scans/${scan.id}`);
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* New Scan Modal */}
        {isNewScanModalOpen && (
          <NewScanForm
            onClose={() => setIsNewScanModalOpen(false)}
            onScanCreated={() => {
              setIsNewScanModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
} 