# Data Ingestion System

A robust API system for handling data ingestion requests with priority-based processing and rate limiting.

## Features

- **RESTful API Endpoints**
  - POST `/ingest`: Submit data ingestion requests
  - GET `/status/:ingestion_id`: Check processing status

- **Priority Queue Processing**
  - Supports HIGH, MEDIUM, LOW priorities
  - Processes higher priority requests first
  - Maintains order based on creation time within same priority

- **Rate Limiting**
  - Processes maximum 3 IDs per batch
  - Enforces 5-second delay between batches
  - Asynchronous processing with status tracking

- **Data Persistence**
  - Uses LowDB for JSON-based storage
  - Maintains ingestion and batch status history

## Technical Stack

### Backend
- Node.js with Express
- LowDB for data persistence
- Jest for testing
- UUID for unique identifiers

### Frontend
- React with Material-UI
- Axios for API communication
- Real-time status updates

## Setup Instructions

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Running Tests**
   ```bash
   cd backend
   npm test
   ```

## API Documentation

### POST /ingest
Submit a new ingestion request.

**Request Body:**
```json
{
  "ids": [1, 2, 3, 4, 5],
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "ingestion_id": "uuid-string"
}
```

### GET /status/:ingestion_id
Get the status of an ingestion request.

**Response:**
```json
{
  "ingestion_id": "uuid-string",
  "status": "triggered",
  "batches": [
    {
      "batch_id": "uuid-string",
      "ids": [1, 2, 3],
      "status": "completed"
    },
    {
      "batch_id": "uuid-string",
      "ids": [4, 5],
      "status": "triggered"
    }
  ]
}
```

## Test Coverage

The test suite verifies:
- Input validation
- Priority queue ordering
- Rate limiting compliance
- Status tracking accuracy
- Error handling
- Edge cases

## Error Handling

The system handles various error scenarios:
- Invalid input validation
- Non-existent ingestion IDs
- Rate limit violations
- Priority conflicts

## Performance Considerations

- Asynchronous processing prevents blocking
- Rate limiting prevents system overload
- Priority queue ensures critical requests are processed first
- Batch processing optimizes resource usage

## Security

- Input validation on all endpoints
- No sensitive data storage
- Rate limiting prevents abuse

## Future Improvements

1. Add authentication/authorization
2. Implement request timeout handling
3. Add more detailed error messages
4. Implement request retry mechanism
5. Add monitoring and logging 