import express from 'express';
import cors from 'cors';
import { ingestRouter } from './routes/ingest.js';
import { statusRouter } from './routes/status.js';

const app = express();

// CORS configuration
app.use(cors({
  origin: 'https://data-ingestion-api-loop-ai.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Routes
app.use('/ingest', ingestRouter);
app.use('/status', statusRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 