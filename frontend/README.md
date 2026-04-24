# BFHL Frontend

A modern React application for processing and visualizing hierarchical node relationships.

## Features

- 📝 Textarea input for node relationships (X->Y format)
- 🚀 Real-time API communication with Express backend
- 📊 Beautiful JSON response viewer with collapsible sections
- ⚠️ Error handling with user-friendly messages
- 🎨 Professional UI with gradient accents and smooth animations
- 📱 Responsive design for desktop and tablet
- ✨ Real-time processing with loading states

## Installation

```bash
cd frontend
npm install
```

## Running the App

Make sure the Express backend is running on port 3000:

```bash
# Terminal 1 - Run the backend
cd /Users/ayush/Bajaj\ finserv
npm start

# Terminal 2 - Run the frontend
cd /Users/ayush/Bajaj\ finserv/frontend
npm start
```

The app will open at `http://localhost:3000` (frontend runs on port 3000 by default with React scripts).

## Usage

1. Enter node relationships in the textarea, one per line (e.g., `A->B`, `A->C`)
2. Click the "Process Nodes" button
3. View the results in collapsible tabs:
   - Summary: Total trees, cycles, largest tree root
   - Valid Edges: Successfully parsed edges
   - Duplicate Edges: Repeated edge relationships
   - Invalid Entries: Malformed entries
   - Hierarchies: Component analysis with tree structures
   - User Info: Submission metadata

## API Response Format

```json
{
  "is_success": true,
  "user_id": "john_doe_17091999",
  "email_id": "john@example.com",
  "college_roll_number": "ABCD123",
  "hierarchies": [...],
  "invalid_entries": [...],
  "duplicate_edges": [...],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

## Design Features

- **Premium Aesthetic**: Light blue gradient header with clean white content areas
- **Responsive Layout**: Two-column grid that stacks on mobile
- **Smooth Animations**: Transitions and loading spinner for better UX
- **Error Handling**: Red banner alerts for clear error visibility
- **JSON Viewer**: Syntax-highlighted JSON display with scrollable container
- **Accessibility**: Semantic HTML, proper color contrast, clear labels

## Technologies

- React 18
- Axios for HTTP requests
- CSS Grid & Flexbox for layout
- No external UI frameworks (pure CSS)

## Environment Variables

If running on a different backend URL, modify the axios call in `App.js`:

```javascript
await axios.post('http://your-backend-url:3000/bfhl', {
  data: edges
});
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Responsive on tablets and mobile devices
