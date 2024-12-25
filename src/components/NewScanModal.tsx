import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

type ScanMethod = 'slow' | 'normal' | 'aggressive'

interface NewScanModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { target: string; method: ScanMethod }) => void
}

export default function NewScanModal({ isOpen, onClose, onSubmit }: NewScanModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    onSubmit({
      target: formData.get('target') as string,
      method: formData.get('method') as ScanMethod,
    })
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      New Vulnerability Scan
                    </Dialog.Title>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="target" className="block text-sm font-medium text-gray-700">
                            Target IP or Domain
                          </label>
                          <input
                            type="text"
                            name="target"
                            id="target"
                            required
                            placeholder="example.com or 192.168.1.1"
                            className="input mt-1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Scan Method
                          </label>
                          <div className="mt-2 space-y-2">
                            {(['slow', 'normal', 'aggressive'] as const).map((method) => (
                              <div key={method} className="flex items-center">
                                <input
                                  type="radio"
                                  name="method"
                                  value={method}
                                  id={`method-${method}`}
                                  defaultChecked={method === 'normal'}
                                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                                />
                                <label
                                  htmlFor={`method-${method}`}
                                  className="ml-3 block text-sm capitalize text-gray-700"
                                >
                                  {method}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button type="submit" className="btn-primary sm:ml-3">
                            Start Scan
                          </button>
                          <button
                            type="button"
                            className="btn-secondary mt-3 sm:mt-0"
                            onClick={onClose}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
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