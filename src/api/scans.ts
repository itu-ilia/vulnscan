import { Scan, ScanMethod } from '../types/scan';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function createScan(target: string, method: string) {
  const response = await fetch(`${API_URL}/flows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target, method }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create scan');
  }

  return response.json();
}

export async function getAllScans() {
  const response = await fetch(`${API_URL}/flows`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch scans');
  }

  return response.json();
}

export async function getScanById(id: string) {
  const response = await fetch(`${API_URL}/flows/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch scan details');
  }

  return response.json();
}

export async function getScanLogs(id: string) {
  const response = await fetch(`${API_URL}/flows/${id}/logs`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch scan logs');
  }

  return response.json();
}

export async function getScanResults(id: string) {
  const response = await fetch(`${API_URL}/flows/${id}/results`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch scan results');
  }

  return response.json();
}

export async function getMetrics() {
  const response = await fetch(`${API_URL}/metrics`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch metrics');
  }

  return response.json();
} 