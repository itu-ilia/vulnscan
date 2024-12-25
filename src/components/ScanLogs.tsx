import { useEffect, useRef } from 'react'
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { LogMessage } from '../types/scan'

interface ScanLogsProps {
  logs: LogMessage[]
}

function getLogIcon(type: LogMessage['type']) {
  switch (type) {
    case 'info':
      return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
    case 'warning':
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    case 'error':
      return <XCircleIcon className="h-5 w-5 text-red-500" />
    case 'success':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />
  }
}

function getLogColor(type: LogMessage['type']) {
  switch (type) {
    case 'info':
      return 'text-blue-700 bg-blue-50'
    case 'warning':
      return 'text-yellow-700 bg-yellow-50'
    case 'error':
      return 'text-red-700 bg-red-50'
    case 'success':
      return 'text-green-700 bg-green-50'
  }
}

export default function ScanLogs({ logs }: ScanLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Scan Logs</h3>
      </div>
      <div className="px-6 py-5">
        <div className="h-96 overflow-y-auto space-y-3 font-mono text-sm">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-md ${getLogColor(log.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.type)}</div>
              <div className="flex-1 space-y-1">
                <p className="font-medium">{log.message}</p>
                <p className="text-xs opacity-75">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  )
} 