import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

function NewIngestion() {
  const [ids, setIds] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const validateIds = (idsString) => {
    const idsArray = idsString.split(',').map(id => id.trim());
    if (idsArray.length === 0) return false;
    return idsArray.every(id => !isNaN(parseInt(id)) && parseInt(id) > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validateIds(ids)) {
      setError('Please enter valid comma-separated numbers (e.g., 1,2,3)');
      setLoading(false);
      return;
    }

    try {
      const idsArray = ids.split(',').map(id => parseInt(id.trim()));
      const response = await axios.post(`${API_BASE_URL}/ingest`, {
        ids: idsArray,
        priority
      });
      setSuccess(`Ingestion request submitted successfully! ID: ${response.data.ingestion_id}`);
      setIds(''); // Reset form
    } catch (err) {
      console.error('Error submitting ingestion:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'An error occurred while submitting the ingestion request'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        New Ingestion Request
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="IDs (comma-separated)"
          value={ids}
          onChange={(e) => setIds(e.target.value)}
          margin="normal"
          required
          error={!!error && !validateIds(ids)}
          helperText={
            error && !validateIds(ids)
              ? 'Please enter valid comma-separated numbers (e.g., 1,2,3)'
              : 'Enter comma-separated numbers (e.g., 1,2,3,4,5)'
          }
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            label="Priority"
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="LOW">Low</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              setIds('');
              setError(null);
              setSuccess(null);
            }}
            disabled={loading}
          >
            Clear
          </Button>
        </Box>
      </form>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Paper>
  );
}

export default NewIngestion; 