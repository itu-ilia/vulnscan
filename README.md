# VulnScan - Vulnerability Scanner Dashboard

A modern web application for running and monitoring vulnerability scans on specified targets.

## Features

- Google OAuth Authentication
- Simple and intuitive interface
- Real-time scan monitoring
- Detailed vulnerability reports
- Multiple scanning modes (Slow, Normal, Aggressive)

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- Headless UI for accessible components
- Hero Icons for beautiful icons

## Getting Started

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd vulnscan
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Deployment

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

### Option 2: Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. The build output will be in the `dist` directory. You can deploy this to any static hosting service:
   - AWS S3 + CloudFront
   - Netlify
   - GitHub Pages
   - Any static file hosting

### Option 3: Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t vulnscan .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:80 vulnscan
   ```

## Development

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Environment Variables

Create a `.env` file in the root directory with these variables:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## License

MIT
