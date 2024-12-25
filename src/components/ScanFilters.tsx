import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckIcon,
} from '@heroicons/react/20/solid'
import { ScanStatus } from '../types/scan'

interface ScanFiltersProps {
  statusFilter: ScanStatus | 'all'
  sortBy: 'date' | 'target' | 'method'
  onStatusFilterChange: (status: ScanStatus | 'all') => void
  onSortChange: (sort: 'date' | 'target' | 'method') => void
}

export default function ScanFilters({
  statusFilter,
  sortBy,
  onStatusFilterChange,
  onSortChange,
}: ScanFiltersProps) {
  const statuses: (ScanStatus | 'all')[] = ['all', 'queued', 'in-progress', 'completed', 'failed']
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'target', label: 'Target' },
    { value: 'method', label: 'Method' },
  ] as const

  return (
    <div className="flex items-center space-x-4">
      <Menu as="div" className="relative">
        <Menu.Button className="btn-secondary flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5" />
          <span>Status: {statusFilter === 'all' ? 'All' : statusFilter}</span>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {statuses.map((status) => (
                <Menu.Item key={status}>
                  {({ active }) => (
                    <button
                      onClick={() => onStatusFilterChange(status)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } ${
                        statusFilter === status ? 'text-primary-600' : 'text-gray-700'
                      } group flex w-full items-center px-4 py-2 text-sm capitalize`}
                    >
                      {statusFilter === status && (
                        <CheckIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                      )}
                      <span className={statusFilter === status ? 'font-medium' : ''}>
                        {status === 'all' ? 'All' : status}
                      </span>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <Menu as="div" className="relative">
        <Menu.Button className="btn-secondary flex items-center space-x-2">
          <ArrowsUpDownIcon className="h-5 w-5" />
          <span>Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}</span>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {sortOptions.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => onSortChange(option.value)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } ${
                        sortBy === option.value ? 'text-primary-600' : 'text-gray-700'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      {sortBy === option.value && (
                        <CheckIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                      )}
                      <span className={sortBy === option.value ? 'font-medium' : ''}>
                        {option.label}
                      </span>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
} 