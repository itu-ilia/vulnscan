import express from 'express';
import { scanController } from '../controllers/scanController';

const router = express.Router();

// Create a new scan
router.post('/', scanController.createScan);

// Get all scans
router.get('/', scanController.getAllScans);

// Get a specific scan by ID
router.get('/:id', scanController.getScanById);

// Get scan logs
router.get('/:id/logs', scanController.getScanLogs);

// Get scan results
router.get('/:id/results', scanController.getScanResults);

export default router; 