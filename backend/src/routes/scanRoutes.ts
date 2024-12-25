import express from 'express';
import { createScan, getAllScans, getScanById, getScanLogs, getScanResults } from '../controllers/scanController';

const router = express.Router();

// Create a new scan
router.post('/', createScan);

// Get all scans
router.get('/', getAllScans);

// Get a specific scan by ID
router.get('/:id', getScanById);

// Get scan logs
router.get('/:id/logs', getScanLogs);

// Get scan results
router.get('/:id/results', getScanResults);

export default router; 