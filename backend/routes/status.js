import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /status/:ingestion_id
router.get('/:ingestion_id', async (req, res) => {
  try {
    await db.read();
    const ingestion = db.data.ingestions.find(i => i.ingestion_id === req.params.ingestion_id);
    
    if (!ingestion) {
      return res.status(404).json({ error: 'Ingestion not found' });
    }

    const batches = db.data.batches.filter(b => b.ingestion_id === ingestion.ingestion_id);
    let status = 'yet_to_start';
    
    if (batches.some(b => b.status === 'triggered')) {
      status = 'triggered';
    }
    if (batches.every(b => b.status === 'completed')) {
      status = 'completed';
    }

    res.json({
      ingestion_id: ingestion.ingestion_id,
      status,
      batches: batches.map(b => ({
        batch_id: b.batch_id,
        ids: b.ids,
        status: b.status
      }))
    });
  } catch (error) {
    console.error('Error fetching ingestion status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as statusRouter }; 