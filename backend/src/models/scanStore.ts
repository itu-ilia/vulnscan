import { Scan, ScanMethod, LogType } from '../types/scan';
import { v4 as uuidv4 } from 'uuid';

class ScanStore {
  private scans: Map<string, Scan>;

  constructor() {
    this.scans = new Map();
  }

  createScan(target: string, method: ScanMethod): Scan {
    const scan: Scan = {
      id: uuidv4(),
      target,
      method,
      status: 'pending',
      progress: 0,
      startTime: new Date(),
      lastActivity: new Date(),
      logs: []
    };

    this.scans.set(scan.id, scan);
    return scan;
  }

  getScan(id: string): Scan | undefined {
    return this.scans.get(id);
  }

  getAllScans(): Scan[] {
    return Array.from(this.scans.values());
  }

  updateScan(id: string, updates: Partial<Scan>): Scan | undefined {
    const scan = this.scans.get(id);
    if (!scan) return undefined;

    const updatedScan = { ...scan, ...updates };
    this.scans.set(id, updatedScan);
    return updatedScan;
  }

  addLog(id: string, message: string, type: LogType = 'info'): boolean {
    const scan = this.scans.get(id);
    if (!scan) return false;

    scan.logs.push({
      timestamp: new Date(),
      type,
      message,
      node: 'scanner',
      action: 'log'
    });

    this.scans.set(id, scan);
    return true;
  }

  updateProgress(id: string, progress: number): boolean {
    const scan = this.scans.get(id);
    if (!scan) return false;

    scan.progress = Math.min(100, Math.max(0, progress));
    scan.lastActivity = new Date();
    this.scans.set(id, scan);
    return true;
  }

  completeScan(id: string, results: Scan['results']): boolean {
    const scan = this.scans.get(id);
    if (!scan) return false;

    scan.status = 'completed';
    scan.progress = 100;
    scan.endTime = new Date();
    scan.results = results;
    scan.lastActivity = new Date();

    this.scans.set(id, scan);
    return true;
  }

  failScan(id: string, error: string): boolean {
    const scan = this.scans.get(id);
    if (!scan) return false;

    scan.status = 'failed';
    scan.endTime = new Date();
    scan.lastActivity = new Date();
    this.addLog(id, error, 'error');

    this.scans.set(id, scan);
    return true;
  }
}

// Create a singleton instance
export const scanStore = new ScanStore(); 