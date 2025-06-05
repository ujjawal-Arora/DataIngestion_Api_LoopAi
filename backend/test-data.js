import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

async function testIngestion() {
  try {
    // Test 1: Submit a high priority request
    console.log('Submitting high priority request...');
    const highPriorityResponse = await axios.post(`${API_BASE_URL}/ingest`, {
      ids: [1, 2, 3, 4, 5],
      priority: 'HIGH'
    });
    console.log('High priority ingestion_id:', highPriorityResponse.data.ingestion_id);

    // Test 2: Submit a medium priority request
    console.log('\nSubmitting medium priority request...');
    const mediumPriorityResponse = await axios.post(`${API_BASE_URL}/ingest`, {
      ids: [6, 7, 8, 9, 10],
      priority: 'MEDIUM'
    });
    console.log('Medium priority ingestion_id:', mediumPriorityResponse.data.ingestion_id);

    // Test 3: Submit a low priority request
    console.log('\nSubmitting low priority request...');
    const lowPriorityResponse = await axios.post(`${API_BASE_URL}/ingest`, {
      ids: [11, 12, 13, 14, 15],
      priority: 'LOW'
    });
    console.log('Low priority ingestion_id:', lowPriorityResponse.data.ingestion_id);

    // Check status of high priority request
    console.log('\nChecking status of high priority request...');
    const statusResponse = await axios.get(`${API_BASE_URL}/status/${highPriorityResponse.data.ingestion_id}`);
    console.log('Status:', JSON.stringify(statusResponse.data, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run the tests
testIngestion(); 