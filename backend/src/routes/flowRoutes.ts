import express from 'express';
import { FlowController } from '../controllers/flowController';

const router = express.Router();
const flowController = new FlowController();

// Flow endpoints
router.get('/flows', flowController.getFlows);
router.get('/flows/:id', flowController.getFlow);
router.post('/flows', flowController.createFlow);
router.get('/flows/:id/logs', flowController.getFlowLogs);
router.get('/flows/:id/results', flowController.getFlowResults);

// Metrics endpoint
router.get('/metrics', flowController.getMetrics);

export default router; 