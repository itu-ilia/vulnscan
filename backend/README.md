# VulnScan Backend API

This is the backend API for the VulnScan vulnerability scanning dashboard. It provides endpoints for managing vulnerability scans and retrieving scan results.

## Features

- Create and manage vulnerability scans
- Real-time scan progress tracking
- Detailed scan results with vulnerability information
- Mock scanning functionality for development

## Tech Stack

- Node.js
- Express.js
- TypeScript
- In-memory data store (for development)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following content:
   ```
   PORT=3000
   NODE_ENV=development
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Scans

- `POST /api/scans` - Create a new scan
  ```json
  {
    "target": "example.com",
    "method": "normal"
  }
  ```

- `GET /api/scans` - Get all scans
- `GET /api/scans/:id` - Get a specific scan by ID

### Health Check

- `GET /health` - Check API health status

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

## License

MIT 