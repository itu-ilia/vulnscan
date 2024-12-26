import { Port, ScanMethod } from '../types/scan';

export async function mockPortScan(target: string, method: ScanMethod): Promise<Port[]> {
  // Simulate different numbers of ports based on scan method
  const ports: Port[] = [
    {
      number: 21,
      protocol: 'tcp',
      service: 'ftp',
      version: 'vsftpd 3.0.3',
      state: 'filtered'
    },
    {
      number: 22,
      protocol: 'tcp',
      service: 'ssh',
      version: 'OpenSSH 8.2p1',
      state: 'filtered'
    },
    {
      number: 80,
      protocol: 'tcp',
      service: 'http',
      version: 'nginx 1.18.0',
      state: 'filtered'
    },
    {
      number: 443,
      protocol: 'tcp',
      service: 'https',
      version: 'nginx 1.18.0',
      state: 'open'
    }
  ];

  // Add more ports for normal and aggressive scans
  if (method === 'normal' || method === 'aggressive') {
    ports.push({
      number: 3306,
      protocol: 'tcp',
      service: 'mysql',
      version: 'MySQL 8.0.26',
      state: 'open'
    });
  }

  // Add even more ports for aggressive scans
  if (method === 'aggressive') {
    ports.push({
      number: 6379,
      protocol: 'tcp',
      service: 'redis',
      version: 'Redis 6.2.5',
      state: 'open'
    });
  }

  return ports;
} 