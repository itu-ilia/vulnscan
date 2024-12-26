export type ScanMethod = 'slow' | 'normal' | 'aggressive';
export type ScanStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
export type LogType = 'info' | 'warning' | 'error' | 'success';
export type StepStatus = 'pending' | 'running' | 'completed' | 'error';
export type ImpactLevel = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';

export interface Scan {
  id: string;
  target: string;
  method: ScanMethod;
  status: ScanStatus;
  progress: number;
  startTime: Date;
  endTime?: Date;
  lastActivity: Date;
  logs: LogEntry[];
  results?: ScanResults;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface LogEntry {
  timestamp: Date;
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
  startTime?: Date;
  endTime?: Date;
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

export interface Statistics {
  totalIssues: number;
  criticalIssues: number;
  highRiskIssues: number;
  mediumRiskIssues: number;
  lowRiskIssues: number;
  protocolDistribution: Record<string, number>;
  serviceDistribution: Record<string, number>;
  stateDistribution: Record<string, number>;
}

export interface ScanSummary {
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highRiskVulnerabilities: number;
  mediumRiskVulnerabilities: number;
  lowRiskVulnerabilities: number;
  openPorts: number;
  filteredPorts: number;
  closedPorts: number;
  uniqueServices: number;
  protocols: string[];
}

export interface ScanResults {
  // 1. Scan Identification
  id: string;
  target: string;
  method: ScanMethod;
  status: ScanStatus;
  startTime: Date;
  endTime: Date;
  scanDuration: number;

  // 2. Steps & Progress
  steps: FlowStep[];
  logs: LogEntry[];

  // 3. Open Ports & Services
  openPorts: PortDetails[];
  totalPorts: number;

  // 4. Statistics & Metrics
  statistics: Statistics & {
    severityDistribution: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    serviceDistribution: Record<string, number>;
    protocolDistribution: Record<string, number>;
    portStateDistribution: Record<string, number>;
  };

  // 5. Summary
  summary: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highRiskVulnerabilities: number;
    mediumRiskVulnerabilities: number;
    lowRiskVulnerabilities: number;
    openPorts: number;
    filteredPorts: number;
    closedPorts: number;
    uniqueServices: number;
    protocols: string[];
    topVulnerableServices: Array<{
      service: string;
      vulnerabilityCount: number;
      highestSeverity: string;
    }>;
  };

  // 6. Configuration
  configuration: {
    scannerVersion: string;
    scannerType: string;
    customCommands?: string[];
  };

  // 7. Error Information (if any)
  error?: {
    code: string;
    message: string;
    details?: string;
    recommendations?: string[];
  };
}

export interface Flow {
  id: string;
  target: string;
  method: ScanMethod;
  status: ScanStatus;
  progress: number;
  startTime: Date;
  endTime?: Date;
  lastActivity: Date;
  steps: FlowStep[];
  logs: LogEntry[];
  results?: ScanResults;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
} 