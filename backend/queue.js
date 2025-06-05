import { v4 as uuidv4 } from 'uuid';
import db from './db.js';
import _ from 'lodash';

const BATCH_SIZE = 3;
const RATE_LIMIT_MS = 5000;
const PRIORITY_MAP = { HIGH: 3, MEDIUM: 2, LOW: 1 };

let processing = false;
let queue = [];

export async function enqueueIngestion({ ids, priority, ingestion_id, created_time }) {
  await db.read();
  // Save ingestion meta
  db.data.ingestions.push({ ingestion_id, priority, created_time });
  // Split ids into batches
  const batches = _.chunk(ids, BATCH_SIZE).map(batchIds => ({
    batch_id: uuidv4(),
    ingestion_id,
    ids: batchIds,
    status: 'yet_to_start',
    priority,
    created_time
  }));
  db.data.batches.push(...batches);
  await db.write();
  // Add to queue
  queue.push(...batches);
  // Sort queue by priority and created_time
  queue = _.orderBy(queue, [b => PRIORITY_MAP[b.priority], 'created_time'], ['desc', 'asc']);
  // Start processing if not already
  if (!processing) processQueue();
}

async function processQueue() {
  processing = true;
  while (queue.length > 0) {
    // Take the next batch
    const batch = queue.shift();
    // Mark as triggered
    await db.read();
    const dbBatch = db.data.batches.find(b => b.batch_id === batch.batch_id);
    if (dbBatch) {
      dbBatch.status = 'triggered';
      await db.write();
    }
    // Simulate external API call for each id
    await Promise.all(batch.ids.map(id => simulateExternalApi(id)));
    // Mark as completed
    await db.read();
    if (dbBatch) {
      dbBatch.status = 'completed';
      await db.write();
    }
    // Wait for rate limit
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
    // Re-sort queue in case new high-priority jobs arrived
    queue = _.orderBy(queue, [b => PRIORITY_MAP[b.priority], 'created_time'], ['desc', 'asc']);
  }
  processing = false;
}

async function simulateExternalApi(id) {
  // Simulate delay and static response
  await new Promise(resolve => setTimeout(resolve, 500));
  return { id, data: 'processed' };
} 