import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Scan, PortDetails } from '../types/scan';
import { getScanById } from '../api/scans';

export default function PortDetailsPage() {
  const { scanId, portNumber } = useParams<{ scanId: string; portNumber: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | null>(null);
  const [portDetails, setPortDetails] = useState<PortDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScanDetails = async () => {
      if (!scanId || !portNumber) return;

      try {
        const scanData = await getScanById(scanId);
        setScan(scanData);

        if (scanData.results) {
          const port = scanData.results.openPorts.find(
            (p) => p.number === parseInt(portNumber, 10)
          );
          if (port) {
            setPortDetails(port);
          } else {
            setError('Port not found in scan results');
          }
        } else {
          setError('Scan results not available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scan details');
      }
    };

    fetchScanDetails();
  }, [scanId, portNumber]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!scan || !portDetails) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 text-sm text-gray-600 bg-white rounded-md shadow hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(`/scans/${scanId}`)}
            className="inline-flex items-center px-4 py-2 text-sm text-gray-600 bg-white rounded-md shadow hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Scan
          </button>
        </nav>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            Port {portDetails.number} - {portDetails.service}
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Service:</p>
              <p className="font-medium">{portDetails.service}</p>
            </div>
            {portDetails.version && (
              <div>
                <p className="text-gray-600">Version:</p>
                <p className="font-medium">{portDetails.version}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">State:</p>
              <p className="font-medium">{portDetails.state}</p>
            </div>
          </div>
        </div>

        {portDetails.vulnerabilities.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Vulnerabilities</h2>
            <div className="space-y-6">
              {portDetails.vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">{vuln.title}</h3>
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        vuln.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : vuln.severity === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : vuln.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {vuln.severity}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600">Description:</p>
                      <p className="mt-1">{vuln.description}</p>
                    </div>

                    <div>
                      <p className="text-gray-600">Attack Vector:</p>
                      <p className="mt-1">{vuln.attackVector}</p>
                    </div>

                    <div>
                      <p className="text-gray-600">Impact:</p>
                      <div className="mt-1 grid grid-cols-3 gap-4">
                        <div>
                          <p className="font-medium">Confidentiality:</p>
                          <p>{vuln.impact.confidentiality}</p>
                        </div>
                        <div>
                          <p className="font-medium">Integrity:</p>
                          <p>{vuln.impact.integrity}</p>
                        </div>
                        <div>
                          <p className="font-medium">Availability:</p>
                          <p>{vuln.impact.availability}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600">Recommendation:</p>
                      <p className="mt-1">{vuln.recommendation}</p>
                    </div>

                    <div>
                      <p className="text-gray-600">Best Practices:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        {vuln.bestPractices.map((practice, index) => (
                          <li key={index}>{practice}</li>
                        ))}
                      </ul>
                    </div>

                    {vuln.references.length > 0 && (
                      <div>
                        <p className="text-gray-600">References:</p>
                        <ul className="mt-1 space-y-1">
                          {vuln.references.map((ref, index) => (
                            <li key={index}>
                              <a
                                href={ref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-800"
                              >
                                {ref}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 