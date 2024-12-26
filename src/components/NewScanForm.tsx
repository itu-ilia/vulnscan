import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createScan } from '../api/scans';
import { ScanMethod } from '../types/scan';

interface NewScanFormProps {
  onClose: () => void;
  onScanCreated: () => void;
}

export default function NewScanForm({ onClose, onScanCreated }: NewScanFormProps) {
  const navigate = useNavigate();
  const [target, setTarget] = useState('');
  const [method, setMethod] = useState<ScanMethod>('normal');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const scan = await createScan(target, method);
      onScanCreated();
      navigate(`/scans/${scan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scan');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">New Scan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="target" className="block text-sm font-medium text-gray-700">
              Target IP/Domain
            </label>
            <input
              type="text"
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="example.com or 192.168.1.1"
              required
            />
          </div>

          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700">
              Scan Method
            </label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as ScanMethod)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="slow">Slow (Less Aggressive)</option>
              <option value="normal">Normal</option>
              <option value="aggressive">Aggressive (Faster)</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Choose the scan intensity. Aggressive scans are faster but may be detected by security systems.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Starting Scan...' : 'Start Scan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 