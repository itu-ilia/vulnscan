export type ScanMethod = 'slow' | 'normal' | 'aggressive';
export type ScanStatus = 'queued' | 'in-progress' | 'completed' | 'failed';
export type LogType = 'info' | 'warning' | 'error' | 'success';

export interface LogEntry {
  timestamp: Date;
  type: LogType;
  message: string;
}

export interface Port {
  number: number;
  service: string;
  version?: string;
  state: 'open' | 'closed' | 'filtered';
}

export interface Vulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  references: string[];
  attackVector: string;
  impact: {
    confidentiality: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
    integrity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
    availability: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  };
  bestPractices: string[];
}

export interface PortDetails extends Port {
  vulnerabilities: Vulnerability[];
}

export interface ScanResults {
  openPorts: PortDetails[];
  totalPorts: number;
  scanDuration: number; // in seconds
}

export interface Scan {
  id: string;
  target: string;
  method: ScanMethod;
  status: ScanStatus;
  progress: number;
  startTime: Date;
  endTime?: Date;
  logs: LogEntry[];
  results?: ScanResults;
} 