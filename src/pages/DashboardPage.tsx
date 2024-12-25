import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan } from '../types/scan';
import { getAllScans } from '../api/scans';
import NewScanForm from '../components/NewScanForm';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const scanData = await getAllScans();
        setScans(scanData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scans');
      }
    };

    const interval = setInterval(() => {
      fetchScans();
    }, 5000);

    fetchScans();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Scan Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">New Scan</h2>
              <NewScanForm />
            </div>
          </div>

          {/* Scans List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Recent Scans</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {scans.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No scans yet</p>
                ) : (
                  scans.map((scan) => (
                    <div
                      key={scan.id}
                      onClick={() => navigate(`/scans/${scan.id}`)}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{scan.target}</h3>
                        <span
                          className={`px-2 py-1 text-sm rounded-full ${
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
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Method:</span>{' '}
                          <span className="capitalize">{scan.method}</span>
                        </div>
                        <div>
                          <span className="font-medium">Started:</span>{' '}
                          {new Date(scan.startTime).toLocaleString()}
                        </div>
                        {scan.endTime && (
                          <div>
                            <span className="font-medium">Completed:</span>{' '}
                            {new Date(scan.endTime).toLocaleString()}
                          </div>
                        )}
                        {scan.status === 'in-progress' && (
                          <div>
                            <span className="font-medium">Progress:</span> {scan.progress}%
                          </div>
                        )}
                      </div>

                      {scan.results && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Open Ports:</span>{' '}
                          {scan.results.openPorts.length}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 