import { Request, Response } from 'express';
import { Flow, FlowStep, LogEntry, ScanStatus, Vulnerability, PortDetails } from '../types/scan';
import { FlowStore } from '../models/flowStore';
import { mockPortScan } from '../utils/portScanner.js';
import { mockFindVulnerabilities } from '../utils/vulnerabilityScanner.js';

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
        return res.status(404).json({ error: 'Results not available yet' });
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
        const completedSteps = currentFlow.steps.filter(
          step => step.status === 'completed'
        ).length;
        const runningStep = currentFlow.steps.find(step => step.status === 'running');
        
        // Calculate progress based on completed steps and running step
        let progress = completedSteps * 25;
        
        // Add 12.5% (half of 25%) for the running step
        if (runningStep) {
          progress += 12.5;
        }
        
        // Update flow with current progress
        flowStore.updateFlow(flowId, { progress: Math.round(progress) });
      }
    }, 500);

    // Update flow status to in-progress with initial steps
    flowStore.updateFlow(flowId, {
      status: 'in-progress',
      progress: 0,
      steps: [
        { name: 'Initialize', status: 'pending', progress: 0 },
        { name: 'Port Discovery', status: 'pending', progress: 0 },
        { name: 'Service Detection', status: 'pending', progress: 0 },
        { name: 'Report Generation', status: 'pending', progress: 0 }
      ]
    });

    // Add initial log
    flowStore.addLog(flowId, 'info', 'scanner', 'initialize', 'Starting scan initialization');

    // Step 1: Initialization (0-25%)
    const initStep = flow.steps.find(step => step.name === 'Initialize');
    if (initStep) {
      initStep.status = 'running';
      flowStore.updateFlow(flowId, { steps: flow.steps });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      initStep.status = 'completed';
      initStep.progress = 100;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'success', 'scanner', 'initialize', 'Scan initialization completed');
    }

    // Step 2: Port Discovery (25-50%)
    const portStep = flow.steps.find(step => step.name === 'Port Discovery');
    if (portStep) {
      portStep.status = 'running';
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'info', 'scanner', 'port_scan', 'Starting port discovery');

      await new Promise(resolve => setTimeout(resolve, 3000));
      const ports = await mockPortScan(flow.target, flow.method);
      
      portStep.status = 'completed';
      portStep.progress = 100;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(
        flowId,
        'success',
        'scanner',
        'port_scan',
        `Port discovery completed. Found ${ports.filter((p: PortDetails) => p.state === 'open').length} open ports`
      );
    }

    // Step 3: Service Detection and Vulnerability Analysis (50-75%)
    const serviceStep = flow.steps.find(step => step.name === 'Service Detection');
    if (serviceStep) {
      serviceStep.status = 'running';
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'info', 'scanner', 'service_detection', 'Starting service detection and vulnerability analysis');

      await new Promise(resolve => setTimeout(resolve, 3000));
      const results = await mockFindVulnerabilities(flow.target, flow.method);
      
      serviceStep.status = 'completed';
      serviceStep.progress = 100;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      
      // Store the results in the flow
      flowStore.setResults(flowId, results);
      
      const totalVulns = results.openPorts.reduce(
        (sum: number, port: PortDetails) => sum + port.vulnerabilities.length,
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

    // Step 4: Report Generation (75-100%)
    const reportStep = flow.steps.find(step => step.name === 'Report Generation');
    if (reportStep) {
      reportStep.status = 'running';
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'info', 'scanner', 'report', 'Generating scan report');

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      reportStep.status = 'completed';
      reportStep.progress = 100;
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