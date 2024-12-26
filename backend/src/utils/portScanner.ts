import { Port } from '../types/scan';

export async function mockPortScan(target: string, method: string): Promise<Port[]> {
  // Simulate scanning delay based on method
  const delay = method === 'slow' ? 5000 : method === 'normal' ? 2000 : 1000;
  await new Promise(resolve => setTimeout(resolve, delay));

  const commonPorts: Port[] = [
    {
      number: 22,
      protocol: 'tcp',
      service: 'ssh',
      version: 'OpenSSH 8.2p1',
      state: 'open'
    },
    {
      number: 80,
      protocol: 'tcp',
      service: 'http',
      version: 'nginx 1.18.0',
      state: 'open'
    },
    {
      number: 443,
      protocol: 'tcp',
      service: 'https',
      version: 'nginx 1.18.0',
      state: 'open'
    }
  ];

  // Add more ports for aggressive scan
  if (method === 'aggressive') {
    return [
      ...commonPorts,
      {
        number: 21,
        protocol: 'tcp',
        service: 'ftp',
        version: 'vsftpd 3.0.3',
        state: 'open'
      },
      {
        number: 3306,
        protocol: 'tcp',
        service: 'mysql',
        version: '5.7.32',
        state: 'open'
      },
      {
        number: 27017,
        protocol: 'tcp',
        service: 'mongodb',
        version: '4.4.1',
        state: 'open'
      }
    ];
  }

  // Add one more port for normal scan
  if (method === 'normal') {
    return [
      ...commonPorts,
      {
        number: 3306,
        protocol: 'tcp',
        service: 'mysql',
        version: '5.7.32',
        state: 'open'
      }
    ];
  }

  // Return only common ports for slow scan
  return commonPorts;
} 