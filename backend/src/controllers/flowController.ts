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
        const totalSteps = currentFlow.steps.length;
        const completedSteps = currentFlow.steps.filter(
          step => step.status === 'completed'
        ).length;
        const runningStep = currentFlow.steps.find(step => step.status === 'running');
        
        // Calculate progress based on completed steps and current step progress
        let progress = 0;
        
        // Add progress from completed steps
        if (completedSteps > 0) {
          progress = (completedSteps / totalSteps) * 100;
        }
        
        // Add progress from the currently running step
        if (runningStep) {
          const stepContribution = 100 / totalSteps;
          const stepProgress = (runningStep.progress / 100) * stepContribution;
          progress += stepProgress;
        }
        
        // Ensure progress doesn't exceed 100%
        progress = Math.min(Math.round(progress), 100);
        
        flowStore.updateFlow(flowId, { progress });
      }
    }, 200);

    // Update flow status to in-progress with more detailed steps
    flowStore.updateFlow(flowId, {
      status: 'in-progress',
      progress: 0,
      steps: [
        { name: 'Initialize', status: 'pending', progress: 0 },
        { name: 'Port Discovery', status: 'pending', progress: 0 },
        { name: 'Service Detection', status: 'pending', progress: 0 },
        { name: 'Vulnerability Analysis', status: 'pending', progress: 0 },
        { name: 'Report Generation', status: 'pending', progress: 0 }
      ]
    });

    // Add initial log
    flowStore.addLog(flowId, 'info', 'scanner', 'initialize', 'Starting scan initialization');

    // Step 1: Initialization with gradual progress
    const initStep = flow.steps.find(step => step.name === 'Initialize');
    if (initStep) {
      initStep.status = 'running';
      initStep.progress = 0;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      
      // Simulate gradual initialization progress
      for (let i = 0; i <= 90; i += 10) {
        initStep.progress = i;
        flowStore.updateFlow(flowId, { steps: flow.steps });
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      initStep.status = 'completed';
      initStep.progress = 100;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'success', 'scanner', 'initialize', 'Scan initialization completed');
    }

    // Step 2: Port Discovery with progress updates
    const portStep = flow.steps.find(step => step.name === 'Port Discovery');
    if (portStep) {
      portStep.status = 'running';
      portStep.progress = 0;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'info', 'scanner', 'port_scan', 'Starting port discovery');

      // Simulate port scanning progress
      for (let i = 0; i <= 90; i += 10) {
        portStep.progress = i;
        flowStore.updateFlow(flowId, { steps: flow.steps });
        await new Promise(resolve => setTimeout(resolve, 75));
      }

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

    // Step 3: Service Detection with progress updates
    const serviceStep = flow.steps.find(step => step.name === 'Service Detection');
    if (serviceStep) {
      serviceStep.status = 'running';
      serviceStep.progress = 0;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'info', 'scanner', 'service_detection', 'Starting service detection');

      // Simulate service detection progress
      for (let i = 0; i <= 90; i += 10) {
        serviceStep.progress = i;
        flowStore.updateFlow(flowId, { steps: flow.steps });
        await new Promise(resolve => setTimeout(resolve, 75));
      }
      
      serviceStep.status = 'completed';
      serviceStep.progress = 100;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(
        flowId,
        'success',
        'scanner',
        'service_detection',
        'Service detection completed'
      );
    }

    // Step 4: Vulnerability Analysis with detailed progress
    const vulnStep = flow.steps.find(step => step.name === 'Vulnerability Analysis');
    if (vulnStep) {
      vulnStep.status = 'running';
      vulnStep.progress = 0;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'info', 'scanner', 'vuln_scan', 'Starting vulnerability analysis');

      // Simulate vulnerability scanning progress
      for (let i = 0; i <= 90; i += 10) {
        vulnStep.progress = i;
        flowStore.updateFlow(flowId, { steps: flow.steps });
        await new Promise(resolve => setTimeout(resolve, 75));
      }

      const results = await mockFindVulnerabilities(flow.target, flow.method);
      
      vulnStep.status = 'completed';
      vulnStep.progress = 100;
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

    // Step 5: Report Generation with progress simulation
    const reportStep = flow.steps.find(step => step.name === 'Report Generation');
    if (reportStep) {
      reportStep.status = 'running';
      reportStep.progress = 0;
      flowStore.updateFlow(flowId, { steps: flow.steps });
      flowStore.addLog(flowId, 'info', 'scanner', 'report', 'Generating scan report');

      // Simulate report generation progress
      for (let i = 0; i <= 90; i += 10) {
        reportStep.progress = i;
        flowStore.updateFlow(flowId, { steps: flow.steps });
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
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