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

// Build adjacency list and track indegree from valid edges
function buildGraphStructure(validEdges) {
  const adjacencyList = {};
  const indegree = {};
  const childrenWithParent = new Set(); // Track children that already have a parent

  validEdges.forEach(edge => {
    const { parent, child } = edge;

    // Skip if child already has a parent (keep first occurrence)
    if (childrenWithParent.has(child)) {
      return;
    }

    childrenWithParent.add(child);

    // Initialize parent in adjacency list if not exists
    if (!adjacencyList[parent]) {
      adjacencyList[parent] = [];
    }

    // Add child to parent's adjacency list
    adjacencyList[parent].push(child);

    // Initialize indegree for parent if not exists
    if (!indegree[parent]) {
      indegree[parent] = 0;
    }

    // Initialize indegree for child if not exists
    if (!indegree[child]) {
      indegree[child] = 0;
    }

    // Increment indegree of child
    indegree[child]++;
  });

  return {
    adjacency_list: adjacencyList,
    indegree: indegree
  };
}

// Find root nodes in the graph
function findRootNodes(adjacencyList, indegree) {
  const rootNodes = [];

  // Root nodes have indegree = 0
  for (const node in indegree) {
    if (indegree[node] === 0) {
      rootNodes.push(node);
    }
  }

  // Also include isolated nodes from adjacency list (nodes with outgoing edges but not in indegree)
  for (const node in adjacencyList) {
    if (!indegree.hasOwnProperty(node) && !rootNodes.includes(node)) {
      rootNodes.push(node);
    }
  }

  rootNodes.sort();

  return {
    root_nodes: rootNodes,
    has_cycle: rootNodes.length === 0 && Object.keys(indegree).length > 0
  };
}

// Detect cycles using DFS
function detectCycles(adjacencyList, indegree) {
  const visited = new Set();
  const recursionStack = new Set();
  let hasCycle = false;

  // DFS helper function
  function dfs(node) {
    visited.add(node);
    recursionStack.add(node);

    // Visit all adjacent nodes
    if (adjacencyList[node]) {
      for (const neighbor of adjacencyList[node]) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (recursionStack.has(neighbor)) {
          // Back edge found - cycle detected
          hasCycle = true;
        }
      }
    }

    recursionStack.delete(node);
  }

  // Start DFS from all nodes
  for (const node in indegree) {
    if (!visited.has(node)) {
      dfs(node);
      if (hasCycle) break;
    }
  }

  return hasCycle;
}

// Build tree structure with depth calculation (only if no cycle)
function buildTree(adjacencyList, rootNodes) {
  const tree = {};

  function buildSubtree(node, depth = 0) {
    tree[node] = {
      depth: depth,
      children: adjacencyList[node] ? [...adjacencyList[node]] : []
    };

    // Recursively build tree for children
    if (adjacencyList[node]) {
      for (const child of adjacencyList[node]) {
        if (!tree[child]) {
          buildSubtree(child, depth + 1);
        }
      }
    }
  }

  // Build tree from each root node
  for (const root of rootNodes) {
    buildSubtree(root, 0);
  }

  return tree;
}

// Build nested tree object from adjacency list starting from roots
function buildNestedTree(adjacencyList, rootNodes) {
  const nestedTree = {};

  function buildNested(node, visited = new Set()) {
    if (visited.has(node)) {
      return {}; // Prevent infinite loops
    }

    visited.add(node);
    const nested = {};

    // Add children as nested objects
    if (adjacencyList[node]) {
      for (const child of adjacencyList[node]) {
        nested[child] = buildNested(child, new Set(visited));
      }
    }

    return nested;
  }

  // Build nested structure from each root
  for (const root of rootNodes) {
    nestedTree[root] = buildNested(root);
  }

  return nestedTree;
}

// Calculate tree depth - number of nodes in longest root to leaf path
function calculateTreeDepth(nestedTree) {
  if (Object.keys(nestedTree).length === 0) {
    return 0;
  }

  function getMaxDepth(node) {
    // If node is empty object (leaf), it counts as 1 node
    if (Object.keys(node).length === 0) {
      return 1;
    }

    // Find maximum depth among all children
    let maxChildDepth = 0;
    for (const child in node) {
      const childDepth = getMaxDepth(node[child]);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }

    // Add 1 for current node
    return 1 + maxChildDepth;
  }

  // Find the maximum depth across all roots
  let maxDepth = 0;
  for (const root in nestedTree) {
    const rootDepth = getMaxDepth(nestedTree[root]);
    maxDepth = Math.max(maxDepth, rootDepth);
  }

  // Add 1 for the root itself
  return maxDepth + 1;
}

// Find all connected components and process each separately
function processConnectedComponents(adjacencyList, indegree) {
  const visited = new Set();
  const components = [];

  // Helper function to find all nodes in a component using BFS
  function getComponentNodes(startNode) {
    const componentNodes = new Set();
    const queue = [startNode];
    componentNodes.add(startNode);

    while (queue.length > 0) {
      const node = queue.shift();

      // Add children
      if (adjacencyList[node]) {
        for (const child of adjacencyList[node]) {
          if (!componentNodes.has(child)) {
            componentNodes.add(child);
            queue.push(child);
          }
        }
      }

      // Add parents (by checking all nodes that have this node as child)
      for (const parent in adjacencyList) {
        if (adjacencyList[parent].includes(node) && !componentNodes.has(parent)) {
          componentNodes.add(parent);
          queue.push(parent);
        }
      }
    }

    return componentNodes;
  }

  // Build graph for each component
  for (const node in indegree) {
    if (!visited.has(node)) {
      const componentNodes = getComponentNodes(node);

      // Build adjacency list and indegree for this component
      const componentAdjList = {};
      const componentIndegree = {};

      for (const componentNode of componentNodes) {
        componentIndegree[componentNode] = indegree[componentNode];
        if (adjacencyList[componentNode]) {
          componentAdjList[componentNode] = adjacencyList[componentNode].filter(
            child => componentNodes.has(child)
          );
        }
      }

      // Find root nodes in this component
      const rootNodes = [];
      for (const componentNode of componentNodes) {
        if (componentIndegree[componentNode] === 0) {
          rootNodes.push(componentNode);
        }
      }

      // Check for cycle in this component
      const hasCycleInComponent = detectCyclesInComponent(componentAdjList, componentIndegree);

      // Build tree and calculate depth only if no cycle
      let componentTree = {};
      let componentDepth = 0;

      if (!hasCycleInComponent && rootNodes.length > 0) {
        const componentNestedTree = buildNestedTree(componentAdjList, rootNodes);
        componentTree = componentNestedTree;
        componentDepth = calculateTreeDepth(componentNestedTree);
      }

      // Create component object
      const componentObj = {
        root_nodes: rootNodes,
        tree: componentTree
      };

      if (hasCycleInComponent) {
        componentObj.has_cycle = true;
      } else if (rootNodes.length > 0) {
        componentObj.depth = componentDepth;
      }

      components.push(componentObj);

      // Mark all nodes in this component as visited
      for (const componentNode of componentNodes) {
        visited.add(componentNode);
      }
    }
  }

  return components;
}

// Detect cycles in a specific component
function detectCyclesInComponent(adjacencyList, indegree) {
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node) {
    visited.add(node);
    recursionStack.add(node);

    if (adjacencyList[node]) {
      for (const neighbor of adjacencyList[node]) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const node in indegree) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }

  return false;
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

    // Build graph structure from valid edges
    const graphStructure = buildGraphStructure(validationResult.valid_edges);

    // Process connected components
    const components = processConnectedComponents(
      graphStructure.adjacency_list,
      graphStructure.indegree
    );

    res.status(200).json({
      is_success: true,
      valid_edges: validationResult.valid_edges,
      duplicate_edges: validationResult.duplicate_edges,
      invalid_entries: validationResult.invalid_entries,
      adjacency_list: graphStructure.adjacency_list,
      indegree: graphStructure.indegree,
      components: components,
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
