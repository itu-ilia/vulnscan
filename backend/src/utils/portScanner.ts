import { PortDetails, ScanMethod } from '../types/scan';

const commonPorts = {
  http: [80, 8080, 8000, 8888],
  https: [443, 8443],
  ssh: [22],
  ftp: [21, 2121],
  mysql: [3306],
  mongodb: [27017, 27018],
  redis: [6379],
  postgresql: [5432],
  elasticsearch: [9200, 9300],
  telnet: [23],
  smtp: [25, 587],
  dns: [53],
  ldap: [389],
  rdp: [3389]
};

const serviceVersions = {
  http: ['nginx/1.18.0', 'nginx/1.20.1', 'Apache/2.4.41', 'Apache/2.4.52', 'nginx/1.22.0'],
  https: ['nginx/1.18.0', 'nginx/1.20.1', 'Apache/2.4.41', 'Apache/2.4.52', 'nginx/1.22.0'],
  ssh: ['OpenSSH/7.6p1', 'OpenSSH/8.2p1', 'OpenSSH/8.4p1', 'OpenSSH/8.9p1'],
  ftp: ['vsftpd/3.0.3', 'vsftpd/3.0.4', 'ProFTPD/1.3.6', 'ProFTPD/1.3.7'],
  mysql: ['5.7.32', '5.7.34', '8.0.26', '8.0.28'],
  mongodb: ['4.4.1', '4.4.4', '5.0.0', '5.0.6'],
  redis: ['6.0.9', '6.2.6', '7.0.0', '7.0.4'],
  postgresql: ['12.8', '13.4', '14.2', '14.4'],
  elasticsearch: ['7.10.0', '7.17.0', '8.0.0', '8.2.0'],
  telnet: ['Linux telnetd'],
  smtp: ['Postfix/3.4.13', 'Postfix/3.5.6', 'Exim/4.94', 'Exim/4.95'],
  dns: ['BIND/9.16.1', 'BIND/9.18.1'],
  ldap: ['OpenLDAP/2.4.49', 'OpenLDAP/2.5.5'],
  rdp: ['xrdp/0.9.12', 'xrdp/0.9.16']
};

function getRandomPort(service: string): number {
  const servicePorts = commonPorts[service as keyof typeof commonPorts] || [];
  return servicePorts[Math.floor(Math.random() * servicePorts.length)] || 
         Math.floor(Math.random() * 65535);
}

function getRandomVersion(service: string): string {
  const versions = serviceVersions[service as keyof typeof serviceVersions] || [];
  return versions[Math.floor(Math.random() * versions.length)] || 'unknown';
}

function getRandomState(): 'open' | 'closed' | 'filtered' {
  const states = ['open', 'closed', 'filtered'];
  const weights = [0.3, 0.5, 0.2]; // 30% open, 50% closed, 20% filtered
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) {
      return states[i] as 'open' | 'closed' | 'filtered';
    }
  }
  return 'closed';
}

function generateRandomPorts(target: string, count: number): PortDetails[] {
  const ports: PortDetails[] = [];
  const services = Object.keys(commonPorts);
  
  // First, add some common ports
  services.forEach(service => {
    if (Math.random() < 0.7) { // 70% chance to include each service
      const port = getRandomPort(service);
      const state = getRandomState();
      if (state === 'open') {
        ports.push({
          number: port,
          protocol: 'tcp',
          service,
          version: getRandomVersion(service),
          state,
          vulnerabilities: []
        });
      } else {
        ports.push({
          number: port,
          protocol: 'tcp',
          service: '',
          version: '',
          state,
          vulnerabilities: []
        });
      }
    }
  });
  
  // Then add some random ports
  while (ports.length < count) {
    const port = Math.floor(Math.random() * 65535);
    if (!ports.find(p => p.number === port)) {
      const state = getRandomState();
      ports.push({
        number: port,
        protocol: 'tcp',
        service: '',
        version: '',
        state,
        vulnerabilities: []
      });
    }
  }
  
  return ports.sort((a, b) => a.number - b.number);
}

export async function mockPortScan(target: string, method: ScanMethod): Promise<PortDetails[]> {
  // Simulate scan delay based on method
  const delay = method === 'slow' ? 3000 : method === 'normal' ? 1500 : 500;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Generate random number of ports between 10 and 20
  const portCount = Math.floor(Math.random() * 11) + 10;
  
  return generateRandomPorts(target, portCount);
} 