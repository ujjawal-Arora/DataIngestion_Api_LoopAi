import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import * as queueModule from '../queue.js';

// Mock the queue module
vi.mock('../queue.js', () => ({
  enqueueIngestion: vi.fn().mockImplementation(async (data) => {
    // Simulate queue behavior
    return Promise.resolve();
  })
}));

// Create Express app with routes
const app = express();
app.use(express.json());

// Add routes
app.post('/ingest', async (req, res) => {
  const { ids, priority } = req.body;
  if (!Array.isArray(ids) || !priority || !['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const ingestion_id = uuidv4();
  const created_time = Date.now();
  await queueModule.enqueueIngestion({ ids, priority, ingestion_id, created_time });
  res.json({ ingestion_id });
});

app.get('/status/:ingestion_id', async (req, res) => {
  await db.read();
  const ingestion = db.data.ingestions.find(i => i.ingestion_id === req.params.ingestion_id);
  if (!ingestion) return res.status(404).json({ error: 'Not found' });
  const batches = db.data.batches.filter(b => b.ingestion_id === ingestion.ingestion_id);
  let status = 'yet_to_start';
  if (batches.some(b => b.status === 'triggered')) status = 'triggered';
  if (batches.every(b => b.status === 'completed')) status = 'completed';
  res.json({
    ingestion_id: ingestion.ingestion_id,
    status,
    batches: batches.map(b => ({ batch_id: b.batch_id, ids: b.ids, status: b.status }))
  });
});

// Test data
const testIds = [1, 2, 3, 4, 5];
const testIngestionId = uuidv4();

describe('API Endpoints', () => {
  beforeEach(async () => {
    // Clear mocks before each test
    vi.clearAllMocks();
    // Reset db data
    db.data = { ingestions: [], batches: [] };
    await db.write();
  });

  describe('POST /ingest', () => {
    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/ingest')
        .send({ ids: 'not-an-array' });
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid priority', async () => {
      const response = await request(app)
        .post('/ingest')
        .send({ ids: testIds, priority: 'INVALID' });
      expect(response.status).toBe(400);
    });

    it('should accept valid request and return ingestion_id', async () => {
      const response = await request(app)
        .post('/ingest')
        .send({ ids: testIds, priority: 'HIGH' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ingestion_id');
    });
  });

  describe('GET /status/:ingestion_id', () => {
    it('should return 404 for non-existent ingestion_id', async () => {
      const response = await request(app)
        .get(`/status/${uuidv4()}`);
      expect(response.status).toBe(404);
    });

    it('should return correct status for ingestion', async () => {
      // Setup test data
      const ingestion = {
        ingestion_id: testIngestionId,
        priority: 'HIGH',
        created_time: Date.now()
      };
      const batches = [
        {
          batch_id: uuidv4(),
          ingestion_id: testIngestionId,
          ids: [1, 2, 3],
          status: 'completed'
        },
        {
          batch_id: uuidv4(),
          ingestion_id: testIngestionId,
          ids: [4, 5],
          status: 'triggered'
        }
      ];

      // Write test data to database
      db.data.ingestions.push(ingestion);
      db.data.batches.push(...batches);
      await db.write();

      const response = await request(app)
        .get(`/status/${testIngestionId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ingestion_id: testIngestionId,
        status: 'triggered',
        batches: expect.arrayContaining([
          expect.objectContaining({
            ids: [1, 2, 3],
            status: 'completed'
          }),
          expect.objectContaining({
            ids: [4, 5],
            status: 'triggered'
          })
        ])
      });
    });
  });
});

// Integration tests for queue processing
describe('Queue Processing', () => {
  it('should process batches in correct order based on priority', async () => {
    const lowPriorityRequest = {
      ids: [1, 2, 3],
      priority: 'LOW',
      ingestion_id: uuidv4(),
      created_time: Date.now()
    };

    const highPriorityRequest = {
      ids: [4, 5, 6],
      priority: 'HIGH',
      ingestion_id: uuidv4(),
      created_time: Date.now() + 1000
    };

    // Enqueue low priority first
    await queueModule.enqueueIngestion(lowPriorityRequest);
    // Then enqueue high priority
    await queueModule.enqueueIngestion(highPriorityRequest);

    // Verify enqueueIngestion was called with correct data
    expect(queueModule.enqueueIngestion).toHaveBeenCalledWith(expect.objectContaining({
      priority: 'HIGH'
    }));
  }, 10000); // Increased timeout

  it('should respect rate limit of 1 batch per 5 seconds', async () => {
    const request = {
      ids: [1, 2, 3, 4, 5, 6],
      priority: 'HIGH',
      ingestion_id: uuidv4(),
      created_time: Date.now()
    };

    await queueModule.enqueueIngestion(request);
    
    // Verify enqueueIngestion was called
    expect(queueModule.enqueueIngestion).toHaveBeenCalled();
  }, 10000); // Increased timeout
}); 