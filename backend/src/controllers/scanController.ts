import { Request, Response } from 'express';
import { Port } from '../types/scan';

const mockPorts: Port[] = [
  {
    number: 80,
    protocol: 'tcp',
    service: 'http',
    version: 'Apache/2.4.41',
    state: 'open'
  },
  {
    number: 443,
    protocol: 'tcp',
    service: 'https',
    version: 'nginx/1.18.0',
    state: 'open'
  },
  {
    number: 22,
    protocol: 'tcp',
    service: 'ssh',
    version: 'OpenSSH 8.2p1',
    state: 'open'
  },
  {
    number: 3306,
    protocol: 'tcp',
    service: 'mysql',
    version: 'MySQL 8.0.26',
    state: 'open'
  },
  {
    number: 27017,
    protocol: 'tcp',
    service: 'mongodb',
    version: 'MongoDB 5.0.2',
    state: 'open'
  },
  {
    number: 6379,
    protocol: 'tcp',
    service: 'redis',
    version: 'Redis 6.2.5',
    state: 'open'
  }
];

export const scanController = {
  getOpenPorts: (req: Request, res: Response) => {
    res.json(mockPorts);
  }
}; 