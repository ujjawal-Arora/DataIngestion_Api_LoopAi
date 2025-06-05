# Data Ingestion System

A full-stack application for managing data ingestion requests with priority-based processing.

## Features

- Submit ingestion requests with multiple IDs
- Priority-based processing (HIGH, MEDIUM, LOW)
- Real-time status tracking
- Modern React frontend with Material-UI
- RESTful API backend with Express
- Persistent storage using LowDB

## Tech Stack

### Frontend
- React
- Material-UI
- Axios
- Vercel (Deployment)

### Backend
- Node.js
- Express
- LowDB (JSON-based database)
- Render (Deployment)

## Project Structure

```
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   └── App.js          # Main application component
│   └── package.json
│
└── backend/                 # Express backend application
    ├── routes/             # API route handlers
    ├── app.js             # Express application setup
    ├── queue.js           # Queue management
    └── db.js              # Database configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The backend server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend application will run on `http://localhost:3001`

## API Endpoints

### POST /ingest
Submit a new ingestion request.

Request body:
```json
{
  "ids": [1, 2, 3],
  "priority": "HIGH" | "MEDIUM" | "LOW"
}
```

Response:
```json
{
  "ingestion_id": "uuid-string"
}
```

### GET /status/:ingestion_id
Get the status of an ingestion request.

Response:
```json
{
  "ingestion_id": "uuid-string",
  "status": "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
  "batches": [
    {
      "id": "batch-id",
      "status": "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
    }
  ]
}
```

## Deployment

### Backend (Render)
- Service URL: https://dataingestion-api-loopai-1.onrender.com
- Environment Variables:
  - `NODE_ENV=production`
  - `PORT=3000`

### Frontend (Vercel)
- Application URL: https://data-ingestion-api-loop-ai.vercel.app
- Environment Variables:
  - `REACT_APP_API_URL=https://dataingestion-api-loopai-1.onrender.com`

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```


