import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FiPlus, FiClock, FiCheck, FiAlertTriangle, FiSearch } from 'react-icons/fi';

// Mock data types
interface Scan {
  id: string;
  target: string;
  method: 'Slow' | 'Normal' | 'Aggressive';
  status: 'In Progress' | 'Completed' | 'Failed';
  startTime: string;
  progress?: number;
  scanType?: 'full' | 'specific-ports';
  ports?: string;
}

const mockScans: Scan[] = [
  {
    id: '1',
    target: 'example.com',
    method: 'Normal',
    status: 'In Progress',
    startTime: '2024-01-26 10:00:00',
    progress: 60,
    scanType: 'full'
  },
  {
    id: '2',
    target: 'test.org',
    method: 'Aggressive',
    status: 'Completed',
    startTime: '2024-01-26 09:00:00',
    scanType: 'specific-ports',
    ports: '80,443,3306'
  },
  {
    id: '3',
    target: 'demo.net',
    method: 'Slow',
    status: 'Failed',
    startTime: '2024-01-26 08:00:00',
    scanType: 'specific-ports',
    ports: '1-1000'
  },
  {
    id: '4',
    target: 'api.example.com',
    method: 'Normal',
    status: 'Completed',
    startTime: '2024-01-26 07:00:00',
    scanType: 'specific-ports',
    ports: '22,80,443,8080,8443'
  }
];

interface ScanData {
  target: string;
  method: 'Slow' | 'Normal' | 'Aggressive';
  scanType: 'full' | 'specific-ports';
  ports?: string; // For specific port ranges or individual ports
}

const DashboardPage = () => {
  const [isNewScanOpen, setIsNewScanOpen] = useState(false);
  const [scans, setScans] = useState<Scan[]>(mockScans);
  const [searchQuery, setSearchQuery] = useState('');
  const [newScanData, setNewScanData] = useState<ScanData>({
    target: '',
    method: 'Normal',
    scanType: 'full',
    ports: '',
  });

  // Filter scans based on search query
  const filteredScans = useMemo(() => {
    if (!searchQuery.trim()) return scans;
    const query = searchQuery.toLowerCase().trim();
    return scans.filter(scan => 
      scan.target.toLowerCase().includes(query)
    );
  }, [scans, searchQuery]);

  const handleStartScan = () => {
    const newScan: Scan = {
      id: (scans.length + 1).toString(),
      target: `${newScanData.target}${newScanData.scanType === 'specific-ports' ? ` (Ports: ${newScanData.ports})` : ''}`,
      method: newScanData.method,
      status: 'In Progress',
      startTime: new Date().toISOString(),
      progress: 0,
    };

    setScans([newScan, ...scans]);
    setIsNewScanOpen(false);
    setNewScanData({
      target: '',
      method: 'Normal',
      scanType: 'full',
      ports: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setIsNewScanOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>New Scan</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by IP or domain name..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Results Summary */}
      {searchQuery && (
        <div className="text-sm text-gray-500">
          Found {filteredScans.length} {filteredScans.length === 1 ? 'result' : 'results'} for "{searchQuery}"
        </div>
      )}

      {/* Scans Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scan Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredScans.length > 0 ? (
              filteredScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`/scans/${scan.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {scan.target}
                    </Link>
                    {scan.scanType === 'specific-ports' && scan.ports && (
                      <div className="text-sm text-gray-500 mt-1">
                        Ports: {scan.ports}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        scan.scanType === 'full'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {scan.scanType === 'full' ? 'Full Scan' : 'Port Scan'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{scan.method}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-sm ${
                        scan.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : scan.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {scan.status === 'Completed' && <FiCheck className="w-4 h-4" />}
                      {scan.status === 'In Progress' && <FiClock className="w-4 h-4" />}
                      {scan.status === 'Failed' && <FiAlertTriangle className="w-4 h-4" />}
                      <span>{scan.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{scan.startTime}</td>
                  <td className="px-6 py-4">
                    {scan.progress !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${scan.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No scans found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Scan Modal */}
      <Transition appear show={isNewScanOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsNewScanOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Start New Scan
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Target IP/Domain
                    </label>
                    <input
                      type="text"
                      value={newScanData.target}
                      onChange={(e) =>
                        setNewScanData({ ...newScanData, target: e.target.value })
                      }
                      className="input mt-1"
                      placeholder="example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Scan Type
                    </label>
                    <div className="mt-2 space-y-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-blue-600"
                          name="scanType"
                          value="full"
                          checked={newScanData.scanType === 'full'}
                          onChange={(e) =>
                            setNewScanData({
                              ...newScanData,
                              scanType: e.target.value as 'full' | 'specific-ports',
                            })
                          }
                        />
                        <span className="ml-2">Full Scan</span>
                      </label>
                      <br />
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-blue-600"
                          name="scanType"
                          value="specific-ports"
                          checked={newScanData.scanType === 'specific-ports'}
                          onChange={(e) =>
                            setNewScanData({
                              ...newScanData,
                              scanType: e.target.value as 'full' | 'specific-ports',
                            })
                          }
                        />
                        <span className="ml-2">Specific Ports</span>
                      </label>
                    </div>
                  </div>

                  {newScanData.scanType === 'specific-ports' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Port Numbers
                      </label>
                      <input
                        type="text"
                        value={newScanData.ports}
                        onChange={(e) =>
                          setNewScanData({ ...newScanData, ports: e.target.value })
                        }
                        className="input mt-1"
                        placeholder="80,443 or 1-1000"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Enter specific ports (e.g., 80,443) or a range (e.g., 1-1000)
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Scan Method
                    </label>
                    <select
                      value={newScanData.method}
                      onChange={(e) =>
                        setNewScanData({
                          ...newScanData,
                          method: e.target.value as ScanData['method'],
                        })
                      }
                      className="input mt-1"
                    >
                      <option value="Slow">Slow</option>
                      <option value="Normal">Normal</option>
                      <option value="Aggressive">Aggressive</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setIsNewScanOpen(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStartScan}
                      disabled={!newScanData.target || (newScanData.scanType === 'specific-ports' && !newScanData.ports)}
                      className="btn btn-primary disabled:opacity-50"
                    >
                      Start Scan
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default DashboardPage; 