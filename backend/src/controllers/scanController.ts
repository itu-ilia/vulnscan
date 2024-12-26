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
  createScan: (req: Request, res: Response) => {
    try {
      const { target, method } = req.body;
      if (!target || !method) {
        return res.status(400).json({ error: 'Target and method are required' });
      }
      res.status(201).json({ id: '123', target, method, status: 'pending' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create scan' });
    }
  },

  getAllScans: (req: Request, res: Response) => {
    try {
      res.json([
        { id: '123', target: 'example.com', method: 'normal', status: 'completed' }
      ]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve scans' });
    }
  },

  getScanById: (req: Request, res: Response) => {
    try {
      const scan = { id: req.params.id, target: 'example.com', method: 'normal', status: 'completed' };
      res.json(scan);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve scan' });
    }
  },

  getScanLogs: (req: Request, res: Response) => {
    try {
      res.json([
        { timestamp: new Date(), type: 'info', message: 'Scan started' }
      ]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve scan logs' });
    }
  },

  getScanResults: (req: Request, res: Response) => {
    try {
      res.json({
        openPorts: mockPorts,
        vulnerabilities: []
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve scan results' });
    }
  }
}; 