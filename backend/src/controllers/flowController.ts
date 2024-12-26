import { Request, Response } from 'express';
import { Flow, FlowStep, LogEntry, ScanStatus, Vulnerability } from '../types/scan';
import { FlowStore } from '../models/flowStore';
import { mockPortScan } from '../utils/portScanner';
import { mockFindVulnerabilities } from '../utils/vulnerabilityScanner';

const flowStore = new FlowStore();

interface Statistics {
  totalScans: number;
  openIssues: number;
  successRate: number;
}

export const flowController = {
  getAllFlows: (req: Request, res: Response) => {
    try {
      const flows = flowStore.getAllFlows();
      res.json(flows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve flows' });
    }
  },

  getActiveFlows: (req: Request, res: Response) => {
    try {
      const flows = flowStore.getActiveFlows();
      res.json(flows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve active flows' });
    }
  },

  getFlowById: (req: Request, res: Response) => {
    try {
      const flow = flowStore.getFlow(req.params.id);
      if (!flow) {
        return res.status(404).json({ error: 'Flow not found' });
      }
      res.json(flow);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve flow' });
    }
  },

  createFlow: (req: Request, res: Response) => {
    try {
      const { target, method } = req.body;

      if (!target || !method) {
        return res.status(400).json({ error: 'Target and method are required' });
      }

      const flow = flowStore.createFlow(target, method);
      
      // Start the flow execution asynchronously
      startFlowExecution(flow.id);

      res.status(201).json(flow);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create flow' });
    }
  },

  getFlowLogs: (req: Request, res: Response) => {
    try {
      const flow = flowStore.getFlow(req.params.id);
      if (!flow) {
        return res.status(404).json({ error: 'Flow not found' });
      }
      res.json(flow.logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve flow logs' });
    }
  },

  getFlowResults: (req: Request, res: Response) => {
    try {
      const flow = flowStore.getFlow(req.params.id);
      if (!flow) {
        return res.status(404).json({ error: 'Flow not found' });
      }
      if (!flow.results) {
        return res.status(404).json({ error: 'Flow results not available' });
      }
      res.json(flow.results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve flow results' });
    }
  },

  getMetrics: (req: Request, res: Response) => {
    try {
      const flows = flowStore.getAllFlows();
      const completedFlows = flows.filter(flow => flow.status === 'completed');
      const failedFlows = flows.filter(flow => flow.status === 'failed');
      
      const metrics: Statistics = {
        totalScans: flows.length,
        openIssues: flows.reduce((total, flow) => {
          if (flow.results) {
            return total + flow.results.openPorts.reduce(
              (portTotal, port) => portTotal + port.vulnerabilities.length,
              0
            );
          }
          return total;
        }, 0),
        successRate: flows.length > 0
          ? (completedFlows.length / flows.length) * 100
          : 0
      };

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve metrics' });
    }
  }
};

async function startFlowExecution(flowId: string) {
  let progressInterval: NodeJS.Timeout | undefined;

  try {
    const flow = flowStore.getFlow(flowId);
    if (!flow) throw new Error('Flow not found');

    // Initialize progress tracking with more frequent updates
    progressInterval = setInterval(() => {
      const currentFlow = flowStore.getFlow(flowId);
      if (currentFlow && currentFlow.status === 'in-progress') {
        const totalSteps = currentFlow.steps.length;
        const completedSteps = currentFlow.steps.filter(
          step => step.status === 'completed'
        ).length;
        const runningStep = currentFlow.steps.find(step => step.status === 'running');
        let progress = (completedSteps / totalSteps) * 100;
        
        if (runningStep) {
          progress += (runningStep.progress / totalSteps);
        }
        
        flowStore.updateFlow(flowId, { progress: Math.round(progress) });
      }
    }, 200);

    // Update flow status to in-progress with more detailed steps
    flowStore.updateFlow(flowId, {
      status: 'in-progress',
      steps: [
        { name: 'initialization', status: 'pending', progress: 0 },
        { name: 'port-scanning', status: 'pending', progress: 0 },
        { name: 'vulnerability-analysis', status: 'pending', progress: 0 },
        { name: 'report-generation', status: 'pending', progress: 0 }
      ]
    });

    // Add initial log
    flowStore.addLog(flowId, 'info', 'scanner', 'initialize', 'Starting scan initialization');

    // Step 1: Initialization with gradual progress
    const initStep = flow.steps.find(step => step.name === 'initialization');
    if (initStep) {
      initStep.status = 'running';
      flowStore.updateFlow(flowId, { steps: flow.steps });
      
      // Simulate gradual initialization progress
      for (let i = 0; i <= 100; i += 20) {
        initStep.progress = i;
        flowStore.updateFlow(flowId, { steps: flow.steps });
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      initStep.status = 'completed';
      initStep.progress = 100;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'success', 'scanner', 'initialize', 'Scan initialization completed');
    }

    // Step 2: Port Scanning with progress updates
    const scanStep = flow.steps.find(step => step.name === 'port-scanning');
    if (scanStep) {
      scanStep.status = 'running';
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'info', 'scanner', 'port_scan', 'Starting port scan');

      // Simulate port scanning progress
      for (let i = 0; i <= 80; i += 20) {
        scanStep.progress = i;
        flowStore.updateFlow(flowId, { steps: flow.steps });
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const ports = await mockPortScan(flow.target, flow.method);
      
      scanStep.progress = 100;
      scanStep.status = 'completed';
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(
        flowId,
        'success',
        'scanner',
        'port_scan',
        `Port scan completed. Found ${ports.length} open ports`
      );
    }

    // Step 3: Vulnerability Analysis with detailed progress
    const vulnStep = flow.steps.find(step => step.name === 'vulnerability-analysis');
    if (vulnStep) {
      vulnStep.status = 'running';
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'info', 'scanner', 'vuln_scan', 'Starting vulnerability analysis');

      // Simulate vulnerability scanning progress
      for (let i = 0; i <= 80; i += 10) {
        vulnStep.progress = i;
        flowStore.updateFlow(flowId, { steps: flow.steps });
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      const results = await mockFindVulnerabilities(flow.target, flow.method);
      
      vulnStep.progress = 100;
      vulnStep.status = 'completed';
      flowStore.updateFlow(flowId, { steps: flow.steps });
      
      // Update flow with results
      flowStore.updateFlow(flowId, { results });
      
      const totalVulns = results.openPorts.reduce(
        (sum: number, port: { vulnerabilities: any[] }) => sum + port.vulnerabilities.length,
        0
      );
      flowStore.addLog(
        flowId,
        'success',
        'scanner',
        'vuln_scan',
        `Vulnerability analysis completed. Found ${totalVulns} vulnerabilities`
      );
    }

    // Step 4: Report Generation with progress simulation
    const reportStep = flow.steps.find(step => step.name === 'report-generation');
    if (reportStep) {
      reportStep.status = 'running';
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'info', 'scanner', 'report', 'Generating scan report');

      // Simulate report generation progress
      for (let i = 0; i <= 90; i += 30) {
        reportStep.progress = i;
        flowStore.updateFlow(flowId, { steps: flow.steps });
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      reportStep.progress = 100;
      reportStep.status = 'completed';
      flowStore.updateFlow(flowId, {
        steps: flow.steps,
        status: 'completed',
        progress: 100,
        endTime: new Date()
      });
      flowStore.addLog(flowId, 'success', 'scanner', 'report', 'Scan report generated successfully');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    flowStore.updateFlow(flowId, {
      status: 'failed',
      error: {
        code: 'FLOW_EXECUTION_ERROR',
        message: errorMessage
      }
    });
    flowStore.addLog(flowId, 'error', 'scanner', 'error', `Scan failed: ${errorMessage}`);
  } finally {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }
} 