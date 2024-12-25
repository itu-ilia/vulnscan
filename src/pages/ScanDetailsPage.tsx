import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ClockIcon,
  ServerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { Scan } from '../types/scan'
import ScanLogs from '../components/ScanLogs'

interface ScanDetailsPageProps {
  scans: Scan[]
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical':
      return 'text-red-700 bg-red-50'
    case 'high':
      return 'text-orange-700 bg-orange-50'
    case 'medium':
      return 'text-yellow-700 bg-yellow-50'
    case 'low':
      return 'text-green-700 bg-green-50'
    default:
      return 'text-gray-700 bg-gray-50'
  }
}

export default function ScanDetailsPage({ scans }: ScanDetailsPageProps) {
  const { scanId } = useParams()
  const navigate = useNavigate()
  const scan = scans.find((s) => s.id === scanId)

  if (!scan) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Not Found</h2>
            <button onClick={() => navigate('/')} className="btn-primary">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Scan Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Scan Overview */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <ServerIcon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">Target:</span>
                  <span>{scan.target}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">Started:</span>
                  <span>{new Date(scan.startTime).toLocaleString()}</span>
                </div>
                {scan.endTime && (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">Completed:</span>
                    <span>{new Date(scan.endTime).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Method:</span>
                  <span className="capitalize">{scan.method}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress and Logs */}
          {scan.status === 'in-progress' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${scan.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{scan.progress}% Complete</span>
                </div>
              </div>

              <ScanLogs logs={scan.logs} />
            </div>
          )}

          {/* Results */}
          {scan.status === 'completed' && scan.results && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Open Ports & Services</h3>
              <div className="space-y-6">
                {scan.results.openPorts.map((port) => (
                  <button
                    key={port.port}
                    onClick={() => navigate(`/scan/${scan.id}/port/${port.port}`)}
                    className="w-full text-left bg-white shadow rounded-lg p-6 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            Port {port.port} - {port.service}
                          </h4>
                          {port.version && (
                            <p className="text-sm text-gray-500">Version: {port.version}</p>
                          )}
                        </div>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    </div>

                    {port.vulnerabilities && port.vulnerabilities.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center space-x-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                          <h5 className="text-sm font-medium">
                            {port.vulnerabilities.length} Vulnerabilities Found
                          </h5>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {port.vulnerabilities.map((vuln) => (
                            <span
                              key={vuln.id}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                getSeverityColor(vuln.severity)
                              }`}
                            >
                              {vuln.severity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 