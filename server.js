const express = require('express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// POST endpoint /bfhl
app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;

    // Validate request body
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        message: 'Invalid request. "data" field must be an array.'
      });
    }

    // Process the data
    const numbers = data.filter(item => !isNaN(item) && item !== '');
    const alphabets = data.filter(item => isNaN(item) && item.length === 1);
    const highestAlphabet = alphabets.length > 0 
      ? [alphabets.sort((a, b) => b.localeCompare(a))[0]]
      : [];

    res.status(200).json({
      is_success: true,
      user_id: "john_doe_17091999",
      email: "john@example.com",
      roll_number: "ABCD123",
      numbers: numbers,
      alphabets: alphabets,
      highest_alphabet: highestAlphabet
    });
  } catch (error) {
    res.status(500).json({
      is_success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET endpoint for health check
app.get('/bfhl', (req, res) => {
  res.status(200).json({
    operation_code: 1
  });
});

// Error handling middleware for 404
app.use((req, res) => {
  res.status(404).json({
    is_success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    is_success: false,
    message: 'An error occurred',
    error: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`POST endpoint available at http://localhost:${PORT}/bfhl`);
});
