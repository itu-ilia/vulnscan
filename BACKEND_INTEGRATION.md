# Backend Integration Documentation for VulnScan

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Authentication](#authentication)
5. [WebSocket Integration](#websocket-integration)
6. [File Structure](#file-structure)
7. [Implementation Guide](#implementation-guide)

## Architecture Overview

### Tech Stack Recommendations
- **Backend Framework**: FastAPI or Django (Python-based for easy integration with security tools)
- **Database**: PostgreSQL (for structured scan data)
- **Cache**: Redis (for real-time scan progress)
- **Message Queue**: RabbitMQ/Celery (for handling long-running scans)
- **WebSocket**: FastAPI WebSockets (for real-time updates)

### High-Level Architecture
```
Frontend (React) <---> API Gateway <---> Backend Services
                                        - Auth Service
                                        - Scan Service
                                        - Report Service
                                        - Notification Service
```

## API Endpoints

### Authentication
```typescript
// src/api/auth.ts
interface AuthAPI {
  login(credentials: GoogleAuthCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthResponse>;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}
```

### Scans
```typescript
// src/api/scans.ts
interface ScanAPI {
  createScan(params: CreateScanParams): Promise<Scan>;
  listScans(filters?: ScanFilters): Promise<ScanListResponse>;
  getScanDetails(scanId: string): Promise<ScanDetails>;
  cancelScan(scanId: string): Promise<void>;
  deleteScan(scanId: string): Promise<void>;
}

interface CreateScanParams {
  target: string;
  method: 'Slow' | 'Normal' | 'Aggressive';
  scanType: 'full' | 'specific-ports';
  ports?: string;
  options?: ScanOptions;
}

interface ScanFilters {
  status?: ScanStatus[];
  dateRange?: DateRange;
  target?: string;
  page?: number;
  limit?: number;
}
```

### Reports
```typescript
// src/api/reports.ts
interface ReportAPI {
  generateReport(scanId: string, format: ReportFormat): Promise<ReportResponse>;
  listReports(scanId: string): Promise<ReportListResponse>;
  getServiceDetails(scanId: string, serviceId: string): Promise<ServiceDetails>;
}
```

## Data Models

### Scan Model
```typescript
// src/types/scan.ts
interface Scan {
  id: string;
  target: string;
  method: ScanMethod;
  scanType: ScanType;
  status: ScanStatus;
  startTime: string;
  endTime?: string;
  progress?: number;
  ports?: string;
  results?: ScanResults;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ScanResults {
  openPorts: Port[];
  vulnerabilities: Vulnerability[];
  services: Service[];
  logs: ScanLog[];
}

interface Port {
  number: number;
  service: string;
  state: string;
  version?: string;
  protocol?: string;
  banner?: string;
}
```

### Vulnerability Model
```typescript
// src/types/vulnerability.ts
interface Vulnerability {
  id: string;
  cveId?: string;
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  recommendation: string;
  references: string[];
  affectedPorts: number[];
  discoveredAt: string;
}
```

## Authentication

### Implementation Steps
1. Create AuthContext and Provider:
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (credentials: GoogleAuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Implementation...
}
```

2. API Client Setup:
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
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## WebSocket Integration

### Real-time Updates
```typescript
// src/hooks/useWebSocket.ts
export function useWebSocket(scanId: string) {
  const socket = useRef<WebSocket | null>(null);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);

  useEffect(() => {
    socket.current = new WebSocket(
      `${process.env.REACT_APP_WS_URL}/scans/${scanId}`
    );

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setScanProgress(data);
    };

    return () => {
      socket.current?.close();
    };
  }, [scanId]);

  return scanProgress;
}
```

## File Structure

```
src/
├── api/
│   ├── auth.ts
│   ├── scans.ts
│   ├── reports.ts
│   └── client.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── ScanContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useScan.ts
│   └── useWebSocket.ts
├── services/
│   ├── scanService.ts
│   └── reportService.ts
└── types/
    ├── scan.ts
    ├── vulnerability.ts
    └── api.ts
```

## Implementation Guide

### 1. Set Up API Integration

1. Install required dependencies:
```bash
npm install axios @tanstack/react-query jwt-decode
```

2. Create API client configuration:
```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL,
  WS_URL: process.env.REACT_APP_WS_URL,
  TIMEOUT: 30000,
};
```

### 2. Update Components

#### DashboardPage
```typescript
// src/pages/DashboardPage.tsx
export function DashboardPage() {
  const { data: scans, isLoading } = useQuery(['scans'], () => 
    scanService.listScans()
  );

  const startScanMutation = useMutation(
    (scanData: CreateScanParams) => scanService.createScan(scanData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['scans']);
      },
    }
  );

  // Implementation...
}
```

#### ScanDetailsPage
```typescript
// src/pages/ScanDetailsPage.tsx
export function ScanDetailsPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const scanProgress = useWebSocket(scanId);
  
  const { data: scanDetails } = useQuery(
    ['scan', scanId],
    () => scanService.getScanDetails(scanId)
  );

  // Implementation...
}
```

### 3. Error Handling

```typescript
// src/utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

export function handleApiError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    return new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || 'An unexpected error occurred',
      error.response?.data?.details
    );
  }
  return new ApiError(500, 'An unexpected error occurred');
}
```

### 4. Environment Setup

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Backend Requirements

### Required Endpoints

1. Authentication:
   - POST /api/auth/google
   - POST /api/auth/refresh
   - POST /api/auth/logout

2. Scans:
   - GET /api/scans
   - POST /api/scans
   - GET /api/scans/{id}
   - DELETE /api/scans/{id}
   - POST /api/scans/{id}/cancel

3. Reports:
   - GET /api/scans/{id}/report
   - GET /api/scans/{id}/services/{serviceId}

### WebSocket Events

```typescript
interface WebSocketEvent {
  type: 'SCAN_PROGRESS' | 'SCAN_COMPLETE' | 'SCAN_ERROR';
  data: {
    scanId: string;
    progress?: number;
    message?: string;
    error?: string;
    results?: ScanResults;
  };
}
```

## Security Considerations

1. **Authentication**:
   - Use JWT tokens with short expiration
   - Implement refresh token rotation
   - Store tokens securely (HttpOnly cookies)

2. **API Security**:
   - Implement rate limiting
   - Use CORS properly
   - Validate all inputs
   - Sanitize outputs

3. **WebSocket Security**:
   - Authenticate WebSocket connections
   - Validate message formats
   - Implement heartbeat mechanism

## Next Steps

1. Set up the backend server (FastAPI/Django)
2. Create database models
3. Implement authentication system
4. Create scan execution service
5. Set up WebSocket server
6. Implement report generation
7. Add error handling and logging
8. Set up CI/CD pipeline

Remember to:
- Use TypeScript for type safety
- Write tests for critical functionality
- Document API endpoints
- Monitor performance
- Implement proper error handling
- Set up logging and monitoring 