# Backend Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Authentication](#authentication)
5. [WebSocket Integration](#websocket-integration)
6. [Error Handling](#error-handling)
7. [Environment Setup](#environment-setup)
8. [Integration Steps](#integration-steps)

## Overview

This document outlines the steps and requirements for integrating the VulnScan frontend with a backend service. The application is designed to handle vulnerability scanning operations with real-time updates and comprehensive reporting features.

## API Endpoints

### Scan Operations
```typescript
// Base URL: /api/v1

// Scans
POST /scans                    // Create new scan
GET /scans                     // List all scans
GET /scans/{id}               // Get scan details
DELETE /scans/{id}            // Delete scan
PUT /scans/{id}/stop          // Stop running scan

// Services
GET /scans/{id}/services             // List all services for a scan
GET /scans/{id}/services/{serviceId} // Get service details

// Reports
GET /scans/{id}/executive-summary    // Get executive summary
GET /scans/{id}/services/{serviceId}/report  // Get service report
```

### Expected Response Formats

#### Scan List Response
```typescript
interface ScanListResponse {
  scans: Array<{
    id: string;
    target: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime: string;
    endTime?: string;
    progress: number;
    servicesCount: number;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
```

#### Scan Details Response
```typescript
interface ScanDetailsResponse {
  id: string;
  target: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  progress: number;
  configuration: {
    ports: string[];
    methods: string[];
    options: Record<string, any>;
  };
  services: Array<{
    id: string;
    port: number;
    protocol: string;
    service: string;
    version?: string;
    status: string;
  }>;
  summary: {
    totalServices: number;
    vulnerabilitiesBySeverity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
}
```

## Data Models

### Core Models

```typescript
// src/types/scan.ts
export interface Scan {
  id: string;
  target: string;
  status: ScanStatus;
  startTime: Date;
  endTime?: Date;
  progress: number;
  configuration: ScanConfiguration;
  services: Service[];
  summary: ScanSummary;
}

// src/types/service.ts
export interface Service {
  id: string;
  port: number;
  protocol: string;
  name: string;
  version?: string;
  state: string;
  banner?: string;
  vulnerabilities: Vulnerability[];
  details: ServiceDetails;
}

// src/types/vulnerability.ts
export interface Vulnerability {
  id: string;
  cveId?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  solution: string;
  references: string[];
}
```

## Authentication

### Implementation

```typescript
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## WebSocket Integration

### Connection Setup

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { ScanProgress } from '../types';

export function useWebSocket(scanId: string) {
  const socket = useRef<WebSocket | null>(null);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    socket.current = new WebSocket(
      `${process.env.REACT_APP_WS_URL}/scans/${scanId}?token=${token}`
    );

    socket.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setScanProgress(data);
      } catch (err) {
        setError(new Error('Failed to parse WebSocket message'));
      }
    };

    socket.current.onerror = (event) => {
      setError(new Error('WebSocket connection error'));
    };

    socket.current.onclose = () => {
      // Implement reconnection logic if needed
    };

    return () => {
      socket.current?.close();
    };
  }, [scanId]);

  return { scanProgress, error };
}
```

## Error Handling

### Error Types

```typescript
// src/types/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class WebSocketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebSocketError';
  }
}
```

### Error Handling Utility

```typescript
// src/utils/errorHandler.ts
import { ApiError, NetworkError } from '../types/errors';

export const handleApiError = (error: any) => {
  if (error.response) {
    // API error with response
    throw new ApiError(
      error.response.status,
      error.response.data.message,
      error.response.data.code,
      error.response.data.details
    );
  } else if (error.request) {
    // Network error
    throw new NetworkError('Network error occurred');
  } else {
    // Other errors
    throw new Error('An unexpected error occurred');
  }
};
```

## Environment Setup

### Environment Variables

```env
# .env.development
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_ENV=development

# .env.production
REACT_APP_API_URL=https://api.vulnscan.com/api/v1
REACT_APP_WS_URL=wss://api.vulnscan.com/ws
REACT_APP_ENV=production
```

## Integration Steps

1. **API Client Setup**
   - Install required dependencies:
     ```bash
     npm install axios @tanstack/react-query
     ```
   - Configure API client with base URL and interceptors
   - Set up authentication handling

2. **Data Fetching Setup**
   - Implement React Query for data fetching:
     ```typescript
     // src/hooks/useScans.ts
     import { useQuery } from '@tanstack/react-query';
     import { scanService } from '../services/scanService';

     export function useScans() {
       return useQuery({
         queryKey: ['scans'],
         queryFn: () => scanService.listScans(),
       });
     }
     ```

3. **WebSocket Integration**
   - Set up WebSocket connection for real-time updates
   - Implement reconnection logic
   - Handle connection errors

4. **Error Handling**
   - Implement global error boundary
   - Set up error tracking (e.g., Sentry)
   - Create error handling utilities

5. **Authentication**
   - Implement authentication flow
   - Set up protected routes
   - Handle token management

6. **Testing**
   - Update tests to mock API calls
   - Add integration tests
   - Test error scenarios

### Example Service Implementation

```typescript
// src/services/scanService.ts
import { apiClient } from '../api/client';
import { handleApiError } from '../utils/errorHandler';
import type { Scan, ScanConfiguration } from '../types';

export const scanService = {
  listScans: async () => {
    try {
      const response = await apiClient.get('/scans');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getScanDetails: async (id: string) => {
    try {
      const response = await apiClient.get(`/scans/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  createScan: async (config: ScanConfiguration) => {
    try {
      const response = await apiClient.post('/scans', config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  stopScan: async (id: string) => {
    try {
      const response = await apiClient.put(`/scans/${id}/stop`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteScan: async (id: string) => {
    try {
      await apiClient.delete(`/scans/${id}`);
    } catch (error) {
      handleApiError(error);
    }
  },
};
```

### Example Component Integration

```typescript
// src/pages/DashboardPage.tsx
import { useScans } from '../hooks/useScans';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function DashboardPage() {
  const { data: scans, isLoading, error } = useScans();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <ErrorBoundary>
      <div className="dashboard">
        {/* Render scans data */}
      </div>
    </ErrorBoundary>
  );
}
```

## Security Considerations

1. **Authentication**
   - Use secure token storage
   - Implement token refresh mechanism
   - Handle session expiration

2. **Data Protection**
   - Encrypt sensitive data
   - Implement rate limiting
   - Use HTTPS for all API calls

3. **Error Handling**
   - Sanitize error messages
   - Log security-related errors
   - Implement proper error boundaries

4. **WebSocket Security**
   - Authenticate WebSocket connections
   - Validate messages
   - Implement reconnection with exponential backoff

## Deployment Considerations

1. **Environment Configuration**
   - Use environment-specific variables
   - Configure CORS properly
   - Set up proper SSL certificates

2. **Performance**
   - Implement caching strategies
   - Use compression
   - Optimize bundle size

3. **Monitoring**
   - Set up error tracking
   - Monitor API performance
   - Track WebSocket connections

## Testing Strategy

1. **Unit Tests**
   - Test API client functions
   - Test error handling
   - Test WebSocket hooks

2. **Integration Tests**
   - Test API integration
   - Test WebSocket integration
   - Test error scenarios

3. **End-to-End Tests**
   - Test complete user flows
   - Test error recovery
   - Test real-time updates 