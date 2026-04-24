# BFHL Node Hierarchy Processor - Complete Setup Guide

## 🚀 Project Overview

A full-stack application for processing and analyzing hierarchical node relationships with graph analysis, cycle detection, and tree structure visualization.

**Repository**: [Bajaj-finserv](https://github.com/Ayush277/Bajaj-finserv)

---

## 📦 Project Structure

```
/Users/ayush/Bajaj finserv/
├── server.js                 # Express backend (port 8000)
├── package.json              # Backend dependencies
├── index.html                # React frontend (standalone HTML)
├── README.md                 # Backend documentation
├── SETUP_GUIDE.md            # This file
└── .git/                     # Version control
```

---

## ✅ Current Status

### Backend Server (Express.js)
- **Status**: ✅ Running on port 8000
- **Command**: `npm start`
- **Features**:
  - POST `/bfhl` - Process node relationships
  - GET `/bfhl` - Health check (returns operation_code: 1)
  - CORS enabled for cross-origin requests
  - Comprehensive error handling

### Frontend (React - Standalone HTML)
- **Status**: ✅ Ready to use
- **File**: `index.html`
- **Access**: Open directly in browser or serve via HTTP
- **Features**:
  - Textarea input for node relationships
  - Submit button with loading state
  - Beautiful gradient UI
  - JSON response viewer
  - Error handling with messages

---

## 🧪 Testing the API

### Using the Web Interface
1. Open `index.html` in your browser
2. Enter node relationships:
   ```
   A->B
   A->C
   B->D
   C->D
   ```
3. Click "Submit"
4. View the JSON response below

### Using cURL (Command Line)
```bash
curl -X POST http://localhost:8000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data":["A->B","B->C"]}'
```

### Sample Response
```json
{
  "is_success": true,
  "user_id": "john_doe_17091999",
  "email_id": "john@example.com",
  "college_roll_number": "ABCD123",
  "hierarchies": [
    {
      "root_nodes": ["A"],
      "tree": {"A": {"B": {"C": {}}}},
      "depth": 4
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

## 🎨 Backend Features

### 1. Input Validation
- Validates format: X->Y (single uppercase letters A-Z)
- Trims whitespace
- Rejects invalid entries with detailed reasons

### 2. Edge Processing
- Removes duplicate edges (keeps first occurrence)
- Prevents self-loops (A->A)
- Handles nodes with multiple parents (keeps first parent)

### 3. Graph Analysis
- Builds adjacency list from valid edges
- Calculates indegree for each node
- Finds root nodes (indegree = 0)
- Detects cycles using DFS

### 4. Tree Structures
- Creates nested tree representation starting from roots
- Calculates tree depth (longest root-to-leaf path)
- Processes each connected component separately

### 5. Component Processing
- Identifies connected components in graph
- Analyzes each component independently
- Reports cycles or tree structures per component

### 6. Summary Generation
- Total number of trees (non-cyclic components)
- Total number of cycles (cyclic components)
- Largest tree root (max depth, lexicographically smaller on tie)

---

## 🎯 Response Format

```json
{
  "is_success": boolean,
  "user_id": "fullname_ddmmyyyy",
  "email_id": "email@example.com",
  "college_roll_number": "XXXX123",
  "hierarchies": [
    {
      "root_nodes": ["A"],
      "tree": { /* nested tree structure */ },
      "depth": 4  // Only if no cycle
      "has_cycle": true  // Only if cycle detected
    }
  ],
  "invalid_entries": [
    {
      "index": 0,
      "value": "invalid",
      "reason": "Invalid format. Expected single uppercase letters A-Z in format X->Y"
    }
  ],
  "duplicate_edges": [
    {
      "parent": "A",
      "child": "B",
      "edge": "A->B"
    }
  ],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

## 🚀 Running the Application

### Step 1 - Start Backend
```bash
cd "/Users/ayush/Bajaj finserv"
npm start
# Server runs on http://localhost:8000
```

### Step 2 - Open Frontend
- Simply open `index.html` in your web browser
- Or serve it via a local server:
```bash
# Using Python 3
python3 -m http.server 8080

# Or using Node.js
npx http-server
```

### Verify Backend is Running
```bash
curl http://localhost:8000/bfhl
# Expected response: {"operation_code":1}
```

---

## 📋 Example Test Cases

### Case 1: Simple Linear Tree
**Input**: `A->B`, `B->C`
**Output**:
- Valid edges: 2
- Duplicate edges: 0
- Invalid entries: 0
- Total trees: 1
- Root: A
- Depth: 4

### Case 2: With Duplicates
**Input**: `A->B`, `A->B`, `B->C`
**Output**:
- Valid edges: 2
- Duplicate edges: 1 (A->B)
- Invalid entries: 0

### Case 3: With Cycles
**Input**: `A->B`, `B->C`, `C->A`
**Output**:
- Valid edges: 3
- Cycles detected: true
- Tree: {} (empty)

### Case 4: Invalid Entries
**Input**: `A->B`, `a->b`, `A-C`, `A->B->C`
**Output**:
- Valid edges: 1
- Invalid entries: 3 with reasons

### Case 5: Multiple Components
**Input**: `A->B`, `B->C`, `D->E`, `E->F`
**Output**:
- Hierarchies: 2 separate trees
- Total trees: 2

---

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Port**: 8000
- **Features**: CORS enabled, JSON middleware, error handling

### Frontend
- **Type**: Standalone HTML with React
- **React**: Loaded via CDN (no build step needed)
- **Styling**: Pure CSS with gradients
- **Access**: Direct browser or via HTTP server

---

## 📝 API Endpoints

### GET /bfhl
Health check endpoint
```
Response: { "operation_code": 1 }
```

### POST /bfhl
Process node relationships
```
Request Body: { "data": ["A->B", "B->C", ...] }
Response: { ...complete response as shown above }
```

---

## ✨ UI Features

- **Gradient Header**: Blue to lighter blue gradient
- **Responsive Layout**: Two-column grid on desktop, single column on mobile
- **Collapsible Tabs**: View different aspects of results
- **Error Banner**: Red alert for failed requests
- **JSON Viewer**: Syntax-highlighted JSON display
- **Loading State**: Spinner during API call
- **Summary Cards**: Quick stats at the top
- **Success Badge**: Visual confirmation

---

## 🛠 Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change the port
PORT=9000 npm start
```

### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:8000/bfhl

# Restart backend
npm start
```

### Network Error in Frontend
- Ensure backend is running on port 8000
- Check frontend URL in App.js points to localhost:8000
- Check browser console for CORS errors

---

## 🎓 What You've Built

✅ **Complete Graph Analysis Engine** with cycle detection
✅ **Professional React UI** with modern design patterns
✅ **REST API** with comprehensive error handling
✅ **Connected Component Analyzer** for complex graphs
✅ **Tree Structure Generator** from hierarchical data
✅ **CORS-enabled Backend** ready for production

---

## 📚 Next Steps (Optional)

1. **Add Database** - Store historical results
2. **Deploy** - Use Docker or cloud platform
3. **Add Visualization** - D3.js or similar for graph drawing
4. **Authentication** - JWT tokens for user sessions
5. **API Documentation** - Swagger/OpenAPI specs
6. **Unit Tests** - Jest and Supertest
7. **CI/CD Pipeline** - GitHub Actions

---

## 📞 Support

All code is well-documented with clear function names and comments. Backend uses DFS for cycle detection and BFS for component analysis.

**Repository**: [Bajaj-finserv on GitHub](https://github.com/Ayush277/Bajaj-finserv)

---

**Built on**: April 24, 2026
**Last Updated**: April 24, 2026
