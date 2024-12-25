import { useState, useMemo } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import NewScanModal from './components/NewScanModal'
import ScansList from './components/ScansList'
import ScanFilters from './components/ScanFilters'
import ScanDetailsPage from './pages/ScanDetailsPage'
import PortDetailsPage from './pages/PortDetailsPage'
import { Scan, ScanMethod, ScanStatus } from './types/scan'

interface DashboardProps {
  scans: Scan[]
  onNewScan: (data: { target: string; method: ScanMethod }) => void
}

function Dashboard({ scans, onNewScan }: DashboardProps) {
  const navigate = useNavigate()
  const [isNewScanModalOpen, setIsNewScanModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ScanStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'target' | 'method'>('date')

  const filteredAndSortedScans = useMemo(() => {
    let filtered = scans
    if (statusFilter !== 'all') {
      filtered = scans.filter((scan) => scan.status === statusFilter)
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        case 'target':
          return a.target.localeCompare(b.target)
        case 'method':
          return a.method.localeCompare(b.method)
        default:
          return 0
      }
    })
  }, [scans, statusFilter, sortBy])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">VulnScan</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">John Doe</span>
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <ScanFilters
              statusFilter={statusFilter}
              sortBy={sortBy}
              onStatusFilterChange={setStatusFilter}
              onSortChange={setSortBy}
            />
            <button className="btn-primary" onClick={() => setIsNewScanModalOpen(true)}>
              + New Scan
            </button>
          </div>
        </div>

        <ScansList
          scans={filteredAndSortedScans}
          onScanClick={(scan) => navigate(`/scan/${scan.id}`)}
        />
      </main>

      <NewScanModal
        isOpen={isNewScanModalOpen}
        onClose={() => setIsNewScanModalOpen(false)}
        onSubmit={(data) => {
          onNewScan(data)
          setIsNewScanModalOpen(false)
        }}
      />
    </div>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scans, setScans] = useState<Scan[]>([])

  const handleNewScan = ({ target, method }: { target: string; method: ScanMethod }) => {
    const newScan: Scan = {
      id: Date.now().toString(),
      target,
      method,
      status: 'in-progress',
      progress: 0,
      startTime: new Date().toISOString(),
      logs: [
        {
          timestamp: new Date().toISOString(),
          type: 'info',
          message: `Starting ${method} scan on target: ${target}`,
        },
      ],
    }
    
    setScans((prev) => [newScan, ...prev])

    // Simulate scan progress
    let progress = 0
    const scanSteps = [
      { message: 'Initializing scan...', type: 'info' as const },
      { message: 'Performing DNS lookup...', type: 'info' as const },
      { message: 'Starting port scan (1-1024)...', type: 'info' as const },
      { message: 'Found open port: 80 (HTTP)', type: 'success' as const },
      { message: 'Found open port: 443 (HTTPS)', type: 'success' as const },
      { message: 'Found open port: 22 (SSH)', type: 'success' as const },
      { message: 'Detected outdated Apache version on port 80', type: 'warning' as const },
      { message: 'Found potential SQL injection vulnerability', type: 'error' as const },
      { message: 'Scanning for known vulnerabilities...', type: 'info' as const },
      { message: 'Analyzing service versions...', type: 'info' as const },
      { message: 'Checking security configurations...', type: 'info' as const },
      { message: 'Generating final report...', type: 'info' as const },
    ]

    let stepIndex = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      
      if (stepIndex < scanSteps.length) {
        setScans((prev) =>
          prev.map((scan) =>
            scan.id === newScan.id
              ? {
                  ...scan,
                  progress: Math.min(Math.round(progress), 100),
                  logs: [
                    ...scan.logs,
                    {
                      timestamp: new Date().toISOString(),
                      ...scanSteps[stepIndex],
                    },
                  ],
                }
              : scan
          )
        )
        stepIndex++
      }

      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setScans((prev) =>
          prev.map((scan) =>
            scan.id === newScan.id
              ? {
                  ...scan,
                  status: 'completed',
                  progress: 100,
                  endTime: new Date().toISOString(),
                  logs: [
                    ...scan.logs,
                    {
                      timestamp: new Date().toISOString(),
                      type: 'success',
                      message: 'Scan completed successfully',
                    },
                  ],
                  results: {
                    openPorts: [
                      {
                        port: 80,
                        service: 'HTTP',
                        version: 'Apache/2.4.46',
                        vulnerabilities: [
                          {
                            id: 'CVE-2021-1234',
                            severity: 'high',
                            title: 'Apache HTTP Server 2.4.46 Remote Code Execution',
                            description:
                              'A remote code execution vulnerability exists in Apache HTTP Server 2.4.46 that could allow an attacker to execute arbitrary code on the affected system.',
                            recommendation:
                              'Upgrade to Apache HTTP Server 2.4.50 or later version.',
                          },
                        ],
                      },
                      {
                        port: 443,
                        service: 'HTTPS',
                        version: 'nginx/1.18.0',
                        vulnerabilities: [
                          {
                            id: 'CVE-2021-5678',
                            severity: 'medium',
                            title: 'TLS Configuration Weakness',
                            description:
                              'The server is using an outdated TLS configuration that may allow downgrade attacks.',
                            recommendation:
                              'Update TLS configuration to use only TLS 1.2 and above with strong cipher suites.',
                          },
                        ],
                      },
                      {
                        port: 22,
                        service: 'SSH',
                        version: 'OpenSSH 8.2p1',
                      },
                    ],
                  },
                }
              : scan
          )
        )
      } else {
        setScans((prev) =>
          prev.map((scan) =>
            scan.id === newScan.id ? { ...scan, progress: Math.round(progress) } : scan
          )
        )
      }
    }, 1000)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to VulnScan</h2>
            <p className="mt-2 text-gray-600">Sign in to start scanning</p>
          </div>
          <button
            onClick={() => setIsLoggedIn(true)}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard scans={scans} onNewScan={handleNewScan} />} />
        <Route path="/scan/:scanId" element={<ScanDetailsPage scans={scans} />} />
        <Route path="/scan/:scanId/port/:portNumber" element={<PortDetailsPage scans={scans} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
