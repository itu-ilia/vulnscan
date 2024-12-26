import { Request, Response } from 'express';
import { FlowStore } from '../models/flowStore';
import { Flow, ScanMethod, PortDetails, Vulnerability, ScanResults } from '../types/scan';
import { mockPortScan } from '../utils/portScanner';
import { mockFindVulnerabilities } from '../utils/vulnerabilityScanner';

export class FlowController {
  private flowStore: FlowStore;

  constructor() {
    this.flowStore = new FlowStore();
  }

  // GET /api/flows
  public getFlows = async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      let flows: Flow[];

      if (status === 'active') {
        flows = this.flowStore.getActiveFlows();
      } else {
        flows = this.flowStore.getAllFlows();
      }

      res.json(flows);
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch flows',
          details: error instanceof Error ? error.message : undefined
        }
      });
    }
  };

  // GET /api/flows/:id
  public getFlow = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const flow = this.flowStore.getFlow(id);

      if (!flow) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Flow not found'
          }
        });
      }

      res.json(flow);
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch flow details',
          details: error instanceof Error ? error.message : undefined
        }
      });
    }
  };

  // POST /api/flows
  public createFlow = async (req: Request, res: Response) => {
    try {
      const { target, method } = req.body;

      if (!target) {
        return res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: 'Target is required'
          }
        });
      }

      if (!method || !['slow', 'normal', 'aggressive'].includes(method)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: 'Valid scan method is required (slow, normal, or aggressive)'
          }
        });
      }

      const flow = this.flowStore.createFlow(target, method as ScanMethod);
      this.startFlowExecution(flow.id);

      res.status(201).json(flow);
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create flow',
          details: error instanceof Error ? error.message : undefined
        }
      });
    }
  };

  // GET /api/flows/:id/logs
  public getFlowLogs = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const flow = this.flowStore.getFlow(id);

      if (!flow) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Flow not found'
          }
        });
      }

      res.json(flow.logs);
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch flow logs',
          details: error instanceof Error ? error.message : undefined
        }
      });
    }
  };

  // GET /api/flows/:id/results
  public getFlowResults = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const flow = this.flowStore.getFlow(id);

      if (!flow) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Flow not found'
          }
        });
      }

      if (!flow.results) {
        return res.status(404).json({
          error: {
            code: 'RESULTS_NOT_AVAILABLE',
            message: 'Results are not available yet'
          }
        });
      }

      res.json(flow.results);
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch flow results',
          details: error instanceof Error ? error.message : undefined
        }
      });
    }
  };

  // GET /api/metrics
  public getMetrics = async (_req: Request, res: Response) => {
    try {
      const metrics = this.flowStore.getMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch metrics',
          details: error instanceof Error ? error.message : undefined
        }
      });
    }
  };

  // Internal methods
  private startFlowExecution = async (flowId: string) => {
    const flow = this.flowStore.getFlow(flowId);
    if (!flow) return;

    try {
      // Update flow status to in-progress
      this.flowStore.updateFlowStatus(flowId, 'in-progress');
      this.flowStore.addLog(
        flowId,
        'info',
        'Orchestrator',
        'Start',
        'Starting vulnerability scan',
        `Method: ${flow.method}`
      );

      // Step 1: Initialization
      await this.executeStep(flowId, 'Initialization', async () => {
        this.flowStore.addLog(
          flowId,
          'info',
          'Initialization',
          'Setup',
          'Preparing scan environment'
        );
        await this.delay(2000);
      });

      // Step 2: Port Scanning
      const ports = await this.executeStep(flowId, 'Port Scanning', async () => {
        this.flowStore.addLog(
          flowId,
          'info',
          'Scanner',
          'Scan',
          'Starting port scan',
          `Target: ${flow.target}`
        );
        await this.delay(3000);
        const ports = await mockPortScan(flow.target, flow.method);
        return ports;
      });

      // Step 3: Service Detection
      const portDetails = await this.executeStep(flowId, 'Service Detection', async () => {
        this.flowStore.addLog(
          flowId,
          'info',
          'Scanner',
          'Detection',
          'Detecting services on open ports'
        );
        await this.delay(2000);
        return ports.map(port => ({ ...port, vulnerabilities: [] }));
      });

      // Step 4: Vulnerability Analysis
      await this.executeStep(flowId, 'Vulnerability Analysis', async () => {
        this.flowStore.addLog(
          flowId,
          'info',
          'Analyzer',
          'Analysis',
          'Analyzing vulnerabilities'
        );

        // Find vulnerabilities for each port
        for (const port of portDetails) {
          const vulns = await mockFindVulnerabilities(port, flow.method);
          port.vulnerabilities = vulns;
          
          if (vulns.length > 0) {
            this.flowStore.addLog(
              flowId,
              'warning',
              'Analyzer',
              'Finding',
              `Found ${vulns.length} vulnerabilities on port ${port.number}`,
              `Service: ${port.service}`
            );
            await this.delay(500);
          }
        }

        // Calculate statistics
        const statistics = this.calculateStatistics(portDetails);

        // Get all logs for the report
        const logs = this.flowStore.getLogs(flowId);

        // Get step information
        const steps = this.flowStore.getFlow(flowId)?.steps || [];

        // Calculate distributions
        const protocolDistribution: Record<string, number> = {};
        const serviceDistribution: Record<string, number> = {};
        const stateDistribution: Record<string, number> = {};

        portDetails.forEach(port => {
          protocolDistribution[port.protocol] = (protocolDistribution[port.protocol] || 0) + 1;
          serviceDistribution[port.service] = (serviceDistribution[port.service] || 0) + 1;
          stateDistribution[port.state] = (stateDistribution[port.state] || 0) + 1;
        });

        // Calculate top vulnerable services
        const serviceVulnerabilities = new Map<string, { count: number; severities: string[] }>();
        portDetails.forEach(port => {
          if (port.vulnerabilities.length > 0) {
            const existing = serviceVulnerabilities.get(port.service) || { count: 0, severities: [] };
            existing.count += port.vulnerabilities.length;
            existing.severities.push(...port.vulnerabilities.map(v => v.severity));
            serviceVulnerabilities.set(port.service, existing);
          }
        });

        const topVulnerableServices = Array.from(serviceVulnerabilities.entries())
          .map(([service, data]) => ({
            service,
            vulnerabilityCount: data.count,
            highestSeverity: this.getHighestSeverity(data.severities)
          }))
          .sort((a, b) => b.vulnerabilityCount - a.vulnerabilityCount)
          .slice(0, 5);

        // Create comprehensive results
        const results: ScanResults = {
          id: flowId,
          target: flow.target,
          method: flow.method,
          status: flow.status,
          startTime: flow.startTime,
          endTime: new Date(),
          scanDuration: this.calculateDuration(flow.startTime),
          steps: steps.map(step => ({
            name: step.name,
            status: step.status,
            progress: step.progress,
            startTime: step.startTime,
            endTime: step.endTime
          })),
          logs,
          openPorts: portDetails,
          totalPorts: portDetails.length,
          statistics: {
            ...statistics,
            severityDistribution: {
              critical: statistics.criticalIssues,
              high: statistics.highRiskIssues,
              medium: statistics.mediumRiskIssues,
              low: statistics.lowRiskIssues
            },
            serviceDistribution,
            protocolDistribution,
            portStateDistribution: stateDistribution
          },
          summary: {
            totalVulnerabilities: statistics.totalIssues,
            criticalVulnerabilities: statistics.criticalIssues,
            highRiskVulnerabilities: statistics.highRiskIssues,
            mediumRiskVulnerabilities: statistics.mediumRiskIssues,
            lowRiskVulnerabilities: statistics.lowRiskIssues,
            openPorts: stateDistribution['open'] || 0,
            filteredPorts: stateDistribution['filtered'] || 0,
            closedPorts: stateDistribution['closed'] || 0,
            uniqueServices: Object.keys(serviceDistribution).length,
            protocols: Object.keys(protocolDistribution),
            topVulnerableServices
          },
          configuration: {
            scannerVersion: '1.0.0',
            scannerType: 'Mock Scanner',
            customCommands: []
          }
        };

        this.flowStore.setResults(flowId, results);
        return results;
      });

      // Mark flow as completed
      this.flowStore.updateFlowStatus(flowId, 'completed');
      this.flowStore.addLog(
        flowId,
        'success',
        'Orchestrator',
        'Complete',
        'Vulnerability scan completed successfully'
      );
    } catch (error) {
      this.flowStore.updateFlowStatus(flowId, 'failed', {
        code: 'EXECUTION_ERROR',
        message: 'Flow execution failed',
        details: error instanceof Error ? error.message : undefined
      });
      this.flowStore.addLog(
        flowId,
        'error',
        'Orchestrator',
        'Error',
        'Flow execution failed',
        error instanceof Error ? error.message : undefined
      );
    }
  };

  private async executeStep<T>(
    flowId: string,
    stepName: string,
    action: (prevResult?: any) => Promise<T>
  ): Promise<T> {
    this.flowStore.updateStepStatus(flowId, stepName, 'running', 0);
    let progressInterval: NodeJS.Timeout;

    try {
      // Simulate progress updates with smaller increments
      progressInterval = setInterval(() => {
        const flow = this.flowStore.getFlow(flowId);
        if (!flow) {
          clearInterval(progressInterval);
          return;
        }

        const step = flow.steps.find(s => s.name === stepName);
        if (!step || step.status !== 'running' || step.progress >= 95) {
          clearInterval(progressInterval);
          return;
        }

        // Calculate a random increment between 2-5%
        const increment = Math.floor(Math.random() * 4) + 2;
        
        this.flowStore.updateStepStatus(
          flowId,
          stepName,
          'running',
          Math.min(95, step.progress + increment)
        );
      }, 200); // Update more frequently

      const result = await action();
      clearInterval(progressInterval);

      // Ensure we show a brief moment at 95% before completing
      this.flowStore.updateStepStatus(flowId, stepName, 'running', 95);
      await this.delay(300);
      
      this.flowStore.updateStepStatus(flowId, stepName, 'completed', 100);
      return result;
    } catch (error) {
      clearInterval(progressInterval);
      this.flowStore.updateStepStatus(flowId, stepName, 'error', 0);
      throw error;
    }
  }

  private calculateStatistics(portDetails: PortDetails[]): Statistics {
    const totalIssues = portDetails.reduce((sum, port) => sum + port.vulnerabilities.length, 0);
    const criticalIssues = portDetails.reduce(
      (sum, port) => sum + port.vulnerabilities.filter(v => v.severity === 'critical').length,
      0
    );
    const highRiskIssues = portDetails.reduce(
      (sum, port) => sum + port.vulnerabilities.filter(v => v.severity === 'high').length,
      0
    );
    const mediumRiskIssues = portDetails.reduce(
      (sum, port) => sum + port.vulnerabilities.filter(v => v.severity === 'medium').length,
      0
    );
    const lowRiskIssues = portDetails.reduce(
      (sum, port) => sum + port.vulnerabilities.filter(v => v.severity === 'low').length,
      0
    );

    const protocolDistribution: Record<string, number> = {};
    portDetails.forEach(port => {
      protocolDistribution[port.protocol] = (protocolDistribution[port.protocol] || 0) + 1;
    });

    const serviceDistribution: Record<string, number> = {};
    portDetails.forEach(port => {
      serviceDistribution[port.service] = (serviceDistribution[port.service] || 0) + 1;
    });

    const stateDistribution: Record<string, number> = {};
    portDetails.forEach(port => {
      stateDistribution[port.state] = (stateDistribution[port.state] || 0) + 1;
    });

    return {
      totalIssues,
      criticalIssues,
      highRiskIssues,
      mediumRiskIssues,
      lowRiskIssues,
      protocolDistribution,
      serviceDistribution,
      stateDistribution
    };
  }

  private getHighestSeverity(severities: string[]): string {
    const severityOrder = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };

    return severities.reduce((highest, current) => {
      if (severityOrder[current as keyof typeof severityOrder] > severityOrder[highest as keyof typeof severityOrder]) {
        return current;
      }
      return highest;
    }, 'low');
  }

  private calculateDuration(startTime: Date): number {
    return Math.round((Date.now() - startTime.getTime()) / 1000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 