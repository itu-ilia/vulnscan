import { Scan, ScanMethod } from '../types/scan';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const createScan = async (target: string, method: ScanMethod): Promise<Scan> => {
  const response = await fetch(`${API_URL}/scans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target, method }),
  });

  if (!response.ok) {
    throw new Error('Failed to create scan');
  }

  return response.json();
};

export const getAllScans = async (): Promise<Scan[]> => {
  const response = await fetch(`${API_URL}/scans`);

  if (!response.ok) {
    throw new Error('Failed to fetch scans');
  }

  return response.json();
};

export const getScanById = async (id: string): Promise<Scan> => {
  const response = await fetch(`${API_URL}/scans/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch scan');
  }

  return response.json();
};

export const getScanLogs = async (id: string) => {
  const response = await fetch(`${API_URL}/scans/${id}/logs`);

  if (!response.ok) {
    throw new Error('Failed to fetch scan logs');
  }

  return response.json();
};

export const getScanResults = async (id: string) => {
  const response = await fetch(`${API_URL}/scans/${id}/results`);

  if (!response.ok) {
    throw new Error('Failed to fetch scan results');
  }

  return response.json();
}; 