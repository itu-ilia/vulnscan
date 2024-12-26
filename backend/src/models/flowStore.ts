import { v4 as uuidv4 } from 'uuid';
import {
  Flow,
  ScanMethod,
  ScanStatus,
  LogType,
  LogEntry,
  StepStatus,
  ScanResults,
  FlowStep
} from '../types/scan';

export class FlowStore {
  private flows: Map<string, Flow> = new Map();

  createFlow(target: string, method: ScanMethod): Flow {
    const id = uuidv4();
    const now = new Date();
    
    const flow: Flow = {
      id,
      target,
      method,
      status: 'pending',
      progress: 0,
      startTime: now,
      lastActivity: now,
      steps: [
        { name: 'Initialization', status: 'pending', progress: 0 },
        { name: 'Port Scanning', status: 'pending', progress: 0 },
        { name: 'Service Detection', status: 'pending', progress: 0 },
        { name: 'Vulnerability Analysis', status: 'pending', progress: 0 }
      ],
      logs: []
    };

    this.flows.set(id, flow);
    return flow;
  }

  getFlow(id: string): Flow | undefined {
    return this.flows.get(id);
  }

  getAllFlows(): Flow[] {
    return Array.from(this.flows.values());
  }

  getActiveFlows(): Flow[] {
    return Array.from(this.flows.values()).filter(
      flow => flow.status === 'pending' || flow.status === 'in-progress'
    );
  }

  updateFlow(id: string, updates: Partial<Flow>): Flow | undefined {
    const flow = this.flows.get(id);
    if (!flow) return undefined;

    const updatedFlow = { ...flow, ...updates };
    this.flows.set(id, updatedFlow);
    return updatedFlow;
  }

  deleteFlow(id: string): boolean {
    return this.flows.delete(id);
  }

  updateFlowStatus(id: string, status: ScanStatus, error?: Flow['error']): void {
    const flow = this.flows.get(id);
    if (!flow) return;

    flow.status = status;
    flow.lastActivity = new Date();

    if (status === 'completed' || status === 'failed') {
      flow.endTime = new Date();
    }

    if (error) {
      flow.error = error;
    }

    this.flows.set(id, flow);
  }

  updateStepStatus(
    id: string,
    stepName: string,
    status: StepStatus,
    progress: number
  ): void {
    const flow = this.flows.get(id);
    if (!flow) return;

    const step = flow.steps.find(s => s.name === stepName);
    if (!step) return;

    step.status = status;
    step.progress = progress;
    flow.lastActivity = new Date();

    if (status === 'running' && !step.startTime) {
      step.startTime = new Date();
    }

    if (status === 'completed' || status === 'error') {
      step.endTime = new Date();
    }

    // Calculate overall progress
    const totalProgress = flow.steps.reduce((sum, s) => sum + s.progress, 0);
    flow.progress = Math.round(totalProgress / flow.steps.length);

    this.flows.set(id, flow);
  }

  addLog(
    id: string,
    type: LogType,
    node: string,
    action: string,
    message: string,
    details?: string
  ): void {
    const flow = this.flows.get(id);
    if (!flow) return;

    const log: LogEntry = {
      timestamp: new Date(),
      type,
      node,
      action,
      message,
      details
    };

    flow.logs.push(log);
    flow.lastActivity = new Date();
    this.flows.set(id, flow);
  }

  getLogs(id: string): LogEntry[] {
    const flow = this.flows.get(id);
    return flow?.logs || [];
  }

  setResults(id: string, results: ScanResults): void {
    const flow = this.flows.get(id);
    if (!flow) return;

    flow.results = results;
    flow.lastActivity = new Date();
    this.flows.set(id, flow);
  }

  getResults(id: string): ScanResults | undefined {
    const flow = this.flows.get(id);
    return flow?.results;
  }

  getMetrics() {
    const flows = this.getAllFlows();
    const totalScans = flows.length;
    const completedScans = flows.filter(f => f.status === 'completed').length;
    const failedScans = flows.filter(f => f.status === 'failed').length;
    const openIssues = flows.reduce((sum, flow) => {
      return sum + (flow.results?.statistics.totalIssues || 0);
    }, 0);
    const successRate = totalScans > 0 ? completedScans / totalScans : 0;

    return {
      totalScans,
      completedScans,
      failedScans,
      openIssues,
      successRate
    };
  }
} 