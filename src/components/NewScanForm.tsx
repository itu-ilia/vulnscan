import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanMethod } from '../types/scan';
import { createScan } from '../api/scans';

export default function NewScanForm() {
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
      navigate(`/scans/${scan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="target" className="block text-sm font-medium text-gray-700">
          Target
        </label>
        <input
          type="text"
          id="target"
          name="target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="example.com or IP address"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="method" className="block text-sm font-medium text-gray-700">
          Scan Method
        </label>
        <select
          id="method"
          name="method"
          value={method}
          onChange={(e) => setMethod(e.target.value as ScanMethod)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="slow">Slow (Less Intensive)</option>
          <option value="normal">Normal</option>
          <option value="aggressive">Aggressive (More Intensive)</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? 'Starting Scan...' : 'Start Scan'}
        </button>
      </div>
    </form>
  );
} 