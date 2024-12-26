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

    // Initialize progress tracking
    progressInterval = setInterval(() => {
      const currentFlow = flowStore.getFlow(flowId);
      if (currentFlow && currentFlow.status === 'in-progress') {
        const totalSteps = currentFlow.steps.length;
        const completedSteps = currentFlow.steps.filter(
          step => step.status === 'completed'
        ).length;
        const progress = Math.round((completedSteps / totalSteps) * 100);
        
        flowStore.updateFlow(flowId, { progress });
      }
    }, 500);

    // Update flow status to in-progress
    flowStore.updateFlow(flowId, {
      status: 'in-progress',
      steps: [
        { name: 'initialization', status: 'pending', progress: 0 },
        { name: 'port-scanning', status: 'pending', progress: 0 },
        { name: 'vulnerability-analysis', status: 'pending', progress: 0 },
        { name: 'report-generation', status: 'pending', progress: 0 }
      ]
    });

    // Step 1: Initialization
    const initStep = flow.steps.find(step => step.name === 'initialization');
    if (initStep) {
      initStep.status = 'running';
      initStep.progress = 50;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      initStep.status = 'completed';
      initStep.progress = 100;
      flowStore.updateFlow(flowId, { steps: flow.steps });
    }

    // Step 2: Port Scanning
    const scanStep = flow.steps.find(step => step.name === 'port-scanning');
    if (scanStep) {
      scanStep.status = 'running';
      scanStep.progress = 0;
      flowStore.updateFlow(flowId, { steps: flow.steps });

      const ports = await mockPortScan(flow.target, flow.method);
      
      scanStep.status = 'completed';
      scanStep.progress = 100;
      flowStore.updateFlow(flowId, { steps: flow.steps });
    }

    // Step 3: Vulnerability Analysis
    const vulnStep = flow.steps.find(step => step.name === 'vulnerability-analysis');
    if (vulnStep) {
      vulnStep.status = 'running';
      vulnStep.progress = 0;
      flowStore.updateFlow(flowId, { steps: flow.steps });

      const results = await mockFindVulnerabilities(flow.target, flow.method);
      
      vulnStep.status = 'completed';
      vulnStep.progress = 100;
      flowStore.updateFlow(flowId, { steps: flow.steps });

      // Update flow with results
      flowStore.updateFlow(flowId, { results });
    }

    // Step 4: Report Generation
    const reportStep = flow.steps.find(step => step.name === 'report-generation');
    if (reportStep) {
      reportStep.status = 'running';
      reportStep.progress = 0;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      reportStep.status = 'completed';
      reportStep.progress = 100;
      flowStore.updateFlow(flowId, {
        steps: flow.steps,
        status: 'completed',
        progress: 100,
        endTime: new Date()
      });
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
  } finally {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }
} 