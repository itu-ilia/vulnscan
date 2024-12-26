import express from 'express';
import { flowController } from '../controllers/flowController';

const router = express.Router();

router.get('/', flowController.getAllFlows);
router.get('/active', flowController.getActiveFlows);
router.get('/:id', flowController.getFlowById);
router.post('/', flowController.createFlow);
router.get('/:id/logs', flowController.getFlowLogs);
router.get('/:id/results', flowController.getFlowResults);
router.get('/metrics', flowController.getMetrics);

export default router; 