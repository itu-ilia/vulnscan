import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scanRoutes from './routes/scanRoutes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Remove trailing slash if it exists
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const normalizedAllowedOrigin = corsOrigin.endsWith('/') ? corsOrigin.slice(0, -1) : corsOrigin;
    
    if (normalizedOrigin === normalizedAllowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/scans', scanRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 