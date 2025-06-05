import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { enqueueIngestion } from '../queue.js';

const router = express.Router();

// POST /ingest
router.post('/', async (req, res) => {
  const { ids, priority } = req.body;

  // Validate input
  if (!Array.isArray(ids) || !priority || !['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const ingestion_id = uuidv4();
    const created_time = Date.now();
    
    // Enqueue the ingestion request
    await enqueueIngestion({ ids, priority, ingestion_id, created_time });
    
    res.json({ ingestion_id });
  } catch (error) {
    console.error('Error processing ingestion request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as ingestRouter }; 