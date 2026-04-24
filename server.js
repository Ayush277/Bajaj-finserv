const express = require('express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Validation function for node strings
function validateNodeStrings(dataArray) {
  const validEdges = [];
  const invalidEntries = [];
  const seenEdges = new Set();
  const duplicateEdges = [];

  dataArray.forEach((entry, index) => {
    // Trim whitespace
    const trimmed = entry.trim();

    // Check if matches pattern X->Y
    const pattern = /^([A-Z])->([A-Z])$/;
    const match = trimmed.match(pattern);

    if (!match) {
      invalidEntries.push({
        index: index,
        value: entry,
        reason: 'Invalid format. Expected single uppercase letters A-Z in format X->Y'
      });
      return;
    }

    const parent = match[1];
    const child = match[2];

    // Check for self-loop (A->A)
    if (parent === child) {
      invalidEntries.push({
        index: index,
        value: entry,
        reason: 'Self-loop detected. Parent and child cannot be the same'
      });
      return;
    }

    // Create edge key for duplicate detection
    const edgeKey = `${parent}->${child}`;

    // Check for duplicates
    if (seenEdges.has(edgeKey)) {
      // Add to duplicates only once per repeated edge
      if (!duplicateEdges.find(d => d.parent === parent && d.child === child)) {
        duplicateEdges.push({
          parent: parent,
          child: child,
          edge: edgeKey
        });
      }
    } else {
      // Valid edge - keep first occurrence
      seenEdges.add(edgeKey);
      validEdges.push({
        parent: parent,
        child: child,
        original: entry
      });
    }
  });

  return {
    valid_edges: validEdges,
    duplicate_edges: duplicateEdges,
    invalid_entries: invalidEntries
  };
}

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

    // Validate that all elements in data array are strings
    if (!data.every(item => typeof item === 'string')) {
      return res.status(400).json({
        is_success: false,
        message: 'Invalid request. All elements in "data" array must be strings.'
      });
    }

    // Validate node strings
    const validationResult = validateNodeStrings(data);

    res.status(200).json({
      is_success: true,
      valid_edges: validationResult.valid_edges,
      duplicate_edges: validationResult.duplicate_edges,
      invalid_entries: validationResult.invalid_entries,
      user_id: "john_doe_17091999",
      email: "john@example.com",
      roll_number: "ABCD123"
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
