import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ShieldExclamationIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { Scan } from '../types/scan'

interface PortDetailsPageProps {
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

export default function PortDetailsPage({ scans }: PortDetailsPageProps) {
  const { scanId, portNumber } = useParams()
  const navigate = useNavigate()
  
  const scan = scans.find((s) => s.id === scanId)
  const port = scan?.results?.openPorts.find((p) => p.port.toString() === portNumber)

  if (!scan || !port) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Port Details Not Found</h2>
            <button onClick={() => navigate(`/scan/${scanId}`)} className="btn-primary">
              Return to Scan Details
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
              onClick={() => navigate(`/scan/${scanId}`)}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Scan</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Port {port.port} Details
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Port Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <ServerIcon className="h-6 w-6 text-gray-400" />
                  <h2 className="text-lg font-medium text-gray-900">Port Information</h2>
                </div>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Service</dt>
                    <dd className="mt-1 text-sm text-gray-900">{port.service}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Version</dt>
                    <dd className="mt-1 text-sm text-gray-900">{port.version || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">Open</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Protocol</dt>
                    <dd className="mt-1 text-sm text-gray-900">TCP</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Vulnerabilities */}
            {port.vulnerabilities && port.vulnerabilities.length > 0 && (
              <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <ShieldExclamationIcon className="h-6 w-6 text-orange-500" />
                    <h2 className="text-lg font-medium text-gray-900">Vulnerabilities</h2>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="space-y-6">
                    {port.vulnerabilities.map((vuln) => (
                      <div
                        key={vuln.id}
                        className={`p-4 rounded-lg ${getSeverityColor(vuln.severity)}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-base font-medium">{vuln.title}</h3>
                          <span className="text-xs font-medium uppercase px-2 py-1 rounded-full bg-white bg-opacity-50">
                            {vuln.severity}
                          </span>
                        </div>
                        <p className="text-sm mb-4">{vuln.description}</p>
                        {vuln.recommendation && (
                          <div className="bg-white bg-opacity-50 rounded-md p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <LightBulbIcon className="h-5 w-5 text-yellow-500" />
                              <h4 className="font-medium">Recommendation</h4>
                            </div>
                            <p className="text-sm">{vuln.recommendation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
                  <h2 className="text-lg font-medium text-gray-900">Security Summary</h2>
                </div>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Risk Level</h3>
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">
                        {port.vulnerabilities?.length ? 'Vulnerable' : 'Secure'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Vulnerabilities Found</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {port.vulnerabilities?.length || 0}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Common Attack Vectors</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {port.service === 'HTTP' && [
                        'SQL Injection',
                        'Cross-Site Scripting (XSS)',
                        'Directory Traversal',
                        'Remote Code Execution',
                      ].map((vector) => (
                        <li key={vector} className="flex items-center space-x-2">
                          <span>•</span>
                          <span>{vector}</span>
                        </li>
                      ))}
                      {port.service === 'SSH' && [
                        'Brute Force Attacks',
                        'Password Spraying',
                        'Protocol Vulnerabilities',
                        'Weak Encryption',
                      ].map((vector) => (
                        <li key={vector} className="flex items-center space-x-2">
                          <span>•</span>
                          <span>{vector}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 