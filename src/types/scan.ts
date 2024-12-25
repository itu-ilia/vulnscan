export type ScanMethod = 'slow' | 'normal' | 'aggressive'
export type ScanStatus = 'queued' | 'in-progress' | 'completed' | 'failed'

export interface LogMessage {
  timestamp: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
}

export interface Scan {
  id: string
  target: string
  method: ScanMethod
  status: ScanStatus
  progress: number
  startTime: string
  endTime?: string
  logs: LogMessage[]
  results?: ScanResults
}

export interface ScanResults {
  openPorts: {
    port: number
    service: string
    version?: string
    vulnerabilities?: Vulnerability[]
  }[]
}

export interface Vulnerability {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  recommendation?: string
} 