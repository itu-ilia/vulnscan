import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Scan } from '../types/scan'
import {
  ClockIcon,
  ServerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface ScanDetailsModalProps {
  scan: Scan | null
  isOpen: boolean
  onClose: () => void
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

export default function ScanDetailsModal({ scan, isOpen, onClose }: ScanDetailsModalProps) {
  if (!scan) return null

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div>
                  <div className="mt-3 sm:mt-0">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      Scan Details
                    </Dialog.Title>

                    {/* Scan Overview */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="col-span-2 flex items-center space-x-2">
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
                    </div>

                    {/* Progress or Results */}
                    {scan.status === 'in-progress' ? (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900">Progress</h4>
                        <div className="mt-2">
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-600 transition-all duration-500"
                              style={{ width: `${scan.progress}%` }}
                            />
                          </div>
                          <span className="mt-1 text-sm text-gray-500">{scan.progress}% Complete</span>
                        </div>
                      </div>
                    ) : scan.results ? (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900">Open Ports & Services</h4>
                        <div className="mt-2 space-y-4">
                          {scan.results.openPorts.map((port) => (
                            <div
                              key={port.port}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                                  <span className="font-medium">Port {port.port}</span>
                                  <span className="text-gray-500">{port.service}</span>
                                </div>
                                {port.version && (
                                  <span className="text-sm text-gray-500">Version: {port.version}</span>
                                )}
                              </div>

                              {port.vulnerabilities && port.vulnerabilities.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <h5 className="text-sm font-medium flex items-center space-x-1">
                                    <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                                    <span>Vulnerabilities Found</span>
                                  </h5>
                                  {port.vulnerabilities.map((vuln) => (
                                    <div
                                      key={vuln.id}
                                      className={`p-3 rounded-md ${getSeverityColor(vuln.severity)}`}
                                    >
                                      <div className="flex justify-between items-start">
                                        <h6 className="font-medium">{vuln.title}</h6>
                                        <span className="text-xs font-medium uppercase">
                                          {vuln.severity}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm">{vuln.description}</p>
                                      {vuln.recommendation && (
                                        <p className="mt-2 text-sm">
                                          <strong>Recommendation:</strong> {vuln.recommendation}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 