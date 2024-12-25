import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { Scan } from '../types/scan'

interface ScansListProps {
  scans: Scan[]
  onScanClick: (scan: Scan) => void
}

export default function ScansList({ scans, onScanClick }: ScansListProps) {
  if (scans.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No scans yet. Click "New Scan" to get started.
      </div>
    )
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {scans.map((scan) => (
          <li key={scan.id}>
            <button
              onClick={() => onScanClick(scan)}
              className="block w-full hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <p className="truncate text-sm font-medium text-primary-600">
                      {scan.target}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          scan.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : scan.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : scan.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      `}
                    >
                      {scan.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(scan.startTime).toLocaleString()}
                      </span>
                      {scan.status === 'in-progress' && (
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 transition-all duration-500"
                            style={{ width: `${scan.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Method: {scan.method}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
} 