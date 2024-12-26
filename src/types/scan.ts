export type ScanMethod = 'slow' | 'normal' | 'aggressive';
export type ScanStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
export type LogType = 'info' | 'warning' | 'error' | 'success';
export type StepStatus = 'pending' | 'running' | 'completed' | 'error';
export type ImpactLevel = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';

export interface LogEntry {
  timestamp: string;
  type: LogType;
  node: string;
  action: string;
  message: string;
  details?: string;
}

export interface FlowStep {
  name: string;
  status: StepStatus;
  progress: number;
  startTime?: string;
  endTime?: string;
}

export interface Port {
  number: number;
  protocol: string;
  service: string;
  version: string;
  state: 'open' | 'filtered' | 'closed';
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
    confidentiality: ImpactLevel;
    integrity: ImpactLevel;
    availability: ImpactLevel;
  };
  bestPractices: string[];
  cve?: string;
  cvss?: number;
}

export interface PortDetails extends Port {
  vulnerabilities: Vulnerability[];
}

export interface ScanResults {
  openPorts: PortDetails[];
  totalPorts: number;
  scanDuration: number;
  statistics: {
    totalIssues: number;
    criticalIssues: number;
    highRiskIssues: number;
    mediumRiskIssues: number;
    lowRiskIssues: number;
    protocolDistribution: Record<string, number>;
  };
}

export interface Flow {
  id: string;
  target: string;
  method: ScanMethod;
  status: ScanStatus;
  progress: number;
  startTime: string;
  lastActivity: string;
  endTime?: string;
  steps: FlowStep[];
  logs: LogEntry[];
  results?: ScanResults;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
} 