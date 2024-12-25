import { Request, Response } from 'express';
import { scanStore } from '../models/scanStore';
import { ScanMethod, Port, Vulnerability } from '../types/scan';

// Mock function to simulate port scanning
const mockScanPorts = async (target: string, method: ScanMethod): Promise<Port[]> => {
  // Simulate scanning delay based on method
  const delay = method === 'slow' ? 5000 : method === 'normal' ? 2000 : 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const commonPorts = [
    { number: 22, service: 'SSH', version: 'OpenSSH 8.2p1', state: 'open' as const },
    { number: 80, service: 'HTTP', version: 'nginx 1.18.0', state: 'open' as const },
    { number: 443, service: 'HTTPS', version: 'nginx 1.18.0', state: 'open' as const }
  ];

  // Add more ports for aggressive scan
  if (method === 'aggressive') {
    return [
      ...commonPorts,
      { number: 21, service: 'FTP', version: 'vsftpd 3.0.3', state: 'open' as const },
      { number: 3306, service: 'MySQL', version: '5.7.32', state: 'open' as const },
      { number: 27017, service: 'MongoDB', version: '4.4.1', state: 'open' as const }
    ];
  }

  // Add one more port for normal scan
  if (method === 'normal') {
    return [
      ...commonPorts,
      { number: 3306, service: 'MySQL', version: '5.7.32', state: 'open' as const }
    ];
  }

  // Return only common ports for slow scan
  return commonPorts;
};

// Mock function to simulate vulnerability detection
const mockFindVulnerabilities = async (port: Port, method: ScanMethod): Promise<Vulnerability[]> => {
  const delay = method === 'slow' ? 2000 : method === 'normal' ? 1000 : 500;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const vulnerabilities: Record<number, Vulnerability[]> = {
    21: [
      {
        id: 'CVE-2020-9273',
        severity: 'high',
        title: 'vsftpd 3.0.3 Buffer Overflow',
        description: 'Buffer overflow vulnerability in vsftpd 3.0.3 allows remote attackers to execute arbitrary code.',
        recommendation: 'Upgrade to vsftpd 3.0.4 or later',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-9273'],
        attackVector: 'Network',
        impact: {
          confidentiality: 'High',
          integrity: 'High',
          availability: 'High'
        },
        bestPractices: [
          'Disable anonymous FTP access',
          'Use SFTP instead of FTP when possible',
          'Implement strong password policies',
          'Regularly update vsftpd to the latest version'
        ]
      }
    ],
    22: [
      {
        id: 'CVE-2020-14145',
        severity: 'medium',
        title: 'OpenSSH Client Information Disclosure',
        description: 'The client side in OpenSSH before 8.4 allows remote servers to trigger a relatively low-impact information disclosure.',
        recommendation: 'Upgrade to OpenSSH 8.4 or later',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-14145'],
        attackVector: 'Network',
        impact: {
          confidentiality: 'Medium',
          integrity: 'Low',
          availability: 'None'
        },
        bestPractices: [
          'Use key-based authentication instead of passwords',
          'Disable root SSH login',
          'Use strong SSH protocol version 2',
          'Implement fail2ban to prevent brute force attacks'
        ]
      }
    ],
    80: [
      {
        id: 'CVE-2021-23017',
        severity: 'high',
        title: 'Nginx HTTP Request Smuggling',
        description: 'A vulnerability in nginx 1.18.0 allows attackers to bypass security controls via HTTP request smuggling.',
        recommendation: 'Upgrade to nginx 1.20.0 or later',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-23017'],
        attackVector: 'Network',
        impact: {
          confidentiality: 'High',
          integrity: 'High',
          availability: 'Medium'
        },
        bestPractices: [
          'Use HTTPS instead of HTTP',
          'Implement proper request size limits',
          'Configure security headers',
          'Regular security audits of nginx configuration'
        ]
      }
    ],
    3306: [
      {
        id: 'CVE-2021-2154',
        severity: 'critical',
        title: 'MySQL Remote Code Execution',
        description: 'A critical vulnerability in MySQL 5.7.32 allows remote attackers to execute arbitrary code.',
        recommendation: 'Upgrade to MySQL 5.7.34 or later',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-2154'],
        attackVector: 'Network',
        impact: {
          confidentiality: 'Critical',
          integrity: 'Critical',
          availability: 'Critical'
        },
        bestPractices: [
          'Restrict remote access to MySQL server',
          'Use strong authentication methods',
          'Regularly update MySQL to the latest version',
          'Implement network segmentation'
        ]
      }
    ],
    27017: [
      {
        id: 'CVE-2021-20329',
        severity: 'high',
        title: 'MongoDB Privilege Escalation',
        description: 'A vulnerability in MongoDB 4.4.1 allows attackers to escalate privileges.',
        recommendation: 'Upgrade to MongoDB 4.4.4 or later',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-20329'],
        attackVector: 'Network',
        impact: {
          confidentiality: 'High',
          integrity: 'High',
          availability: 'Medium'
        },
        bestPractices: [
          'Enable authentication',
          'Use role-based access control',
          'Encrypt data at rest',
          'Regular security audits'
        ]
      }
    ]
  };

  // Return vulnerabilities based on scan method
  if (method === 'slow') {
    // Only return critical vulnerabilities
    return (vulnerabilities[port.number] || []).filter(v => v.severity === 'critical');
  }

  if (method === 'normal') {
    // Return high and critical vulnerabilities
    return (vulnerabilities[port.number] || []).filter(v => ['high', 'critical'].includes(v.severity));
  }

  // Return all vulnerabilities for aggressive scan
  return vulnerabilities[port.number] || [];
};

export const createScan = async (req: Request, res: Response) => {
  try {
    const { target, method } = req.body;

    if (!target || !method) {
      return res.status(400).json({ error: 'Target and method are required' });
    }

    if (!['slow', 'normal', 'aggressive'].includes(method)) {
      return res.status(400).json({ error: 'Invalid scan method' });
    }

    const scan = scanStore.createScan(target, method as ScanMethod);
    
    // Start scanning process asynchronously
    (async () => {
      try {
        scanStore.addLog(scan.id, 'Starting port scan...', 'info');
        scanStore.updateScan(scan.id, { status: 'in-progress' });

        const ports = await mockScanPorts(target, method as ScanMethod);
        scanStore.updateProgress(scan.id, 50);
        scanStore.addLog(scan.id, `Found ${ports.length} open ports`, 'success');

        // Find vulnerabilities for each port
        const portDetails = await Promise.all(
          ports.map(async (port) => {
            scanStore.addLog(scan.id, `Analyzing port ${port.number}...`, 'info');
            const vulnerabilities = await mockFindVulnerabilities(port, method as ScanMethod);
            if (vulnerabilities.length > 0) {
              scanStore.addLog(
                scan.id,
                `Found ${vulnerabilities.length} vulnerabilities on port ${port.number}`,
                'warning'
              );
            }
            return { ...port, vulnerabilities };
          })
        );

        scanStore.completeScan(scan.id, {
          openPorts: portDetails,
          totalPorts: 1000,
          scanDuration: method === 'slow' ? 30 : method === 'normal' ? 15 : 10
        });

      } catch (error) {
        scanStore.failScan(scan.id, error instanceof Error ? error.message : 'Unknown error occurred');
      }
    })();

    res.status(201).json(scan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create scan' });
  }
};

export const getAllScans = (req: Request, res: Response) => {
  try {
    const scans = scanStore.getAllScans();
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve scans' });
  }
};

export const getScanById = (req: Request, res: Response) => {
  try {
    const scan = scanStore.getScan(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    res.json(scan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve scan' });
  }
};

export const getScanLogs = (req: Request, res: Response) => {
  try {
    const scan = scanStore.getScan(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    res.json(scan.logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve scan logs' });
  }
};

export const getScanResults = (req: Request, res: Response) => {
  try {
    const scan = scanStore.getScan(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    if (!scan.results) {
      return res.status(404).json({ error: 'Scan results not available' });
    }
    res.json(scan.results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve scan results' });
  }
}; 