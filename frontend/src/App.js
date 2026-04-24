import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [inputData, setInputData] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);
    setLoading(true);

    // Parse input data
    const edges = inputData
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (edges.length === 0) {
      setError('Please enter at least one node relationship');
      setLoading(false);
      return;
    }

    try {
      const result = await axios.post('http://localhost:3000/bfhl', {
        data: edges
      });

      setResponse(result.data);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to process nodes';
      setError(errorMsg);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputData('');
    setResponse(null);
    setError('');
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1 className="title">BFHL Node Hierarchy Processor</h1>
          <p className="subtitle">Process hierarchical node relationships and analyze connected components</p>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="container">
          <div className="input-section">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="input-textarea" className="form-label">
                  Node Relationships
                </label>
                <textarea
                  id="input-textarea"
                  className="textarea"
                  placeholder={'Enter node relationships, one per line:\nA->B\nA->C\nB->D\nC->D'}
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  rows={10}
                />
              </div>

              <div className="button-group">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner">⟳</span> Processing...
                    </>
                  ) : (
                    <>
                      ▶ Process Nodes
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {response && (
            <div className="response-section">
              <div className="response-header">
                <h2>Response</h2>
                <span className="success-badge">✓ Success</span>
              </div>

              <div className="tabs">
                <details className="tab-group" open>
                  <summary className="tab-title">📊 Summary</summary>
                  <div className="tab-content">
                    <div className="summary-grid">
                      <div className="summary-card">
                        <div className="summary-label">Total Trees</div>
                        <div className="summary-value">{response.summary?.total_trees ?? 0}</div>
                      </div>
                      <div className="summary-card">
                        <div className="summary-label">Total Cycles</div>
                        <div className="summary-value">{response.summary?.total_cycles ?? 0}</div>
                      </div>
                      <div className="summary-card">
                        <div className="summary-label">Largest Tree Root</div>
                        <div className="summary-value code">{response.summary?.largest_tree_root ?? '-'}</div>
                      </div>
                    </div>
                  </div>
                </details>

                <details className="tab-group">
                  <summary className="tab-title">🔗 Valid Edges ({response.valid_edges?.length ?? 0})</summary>
                  <div className="tab-content">
                    <JSONViewer data={response.valid_edges} />
                  </div>
                </details>

                <details className="tab-group">
                  <summary className="tab-title">⚠️ Duplicate Edges ({response.duplicate_edges?.length ?? 0})</summary>
                  <div className="tab-content">
                    {response.duplicate_edges?.length > 0 ? (
                      <JSONViewer data={response.duplicate_edges} />
                    ) : (
                      <p className="empty-message">No duplicate edges found</p>
                    )}
                  </div>
                </details>

                <details className="tab-group">
                  <summary className="tab-title">❌ Invalid Entries ({response.invalid_entries?.length ?? 0})</summary>
                  <div className="tab-content">
                    {response.invalid_entries?.length > 0 ? (
                      <JSONViewer data={response.invalid_entries} />
                    ) : (
                      <p className="empty-message">No invalid entries found</p>
                    )}
                  </div>
                </details>

                <details className="tab-group">
                  <summary className="tab-title">🌳 Hierarchies ({response.hierarchies?.length ?? 0})</summary>
                  <div className="tab-content">
                    <JSONViewer data={response.hierarchies} />
                  </div>
                </details>

                <details className="tab-group">
                  <summary className="tab-title">👤 User Info</summary>
                  <div className="tab-content">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">User ID:</span>
                        <span className="info-value code">{response.user_id}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value code">{response.email_id}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Roll Number:</span>
                        <span className="info-value code">{response.college_roll_number}</span>
                      </div>
                    </div>
                  </div>
                </details>

                <details className="tab-group">
                  <summary className="tab-title">📄 Full JSON</summary>
                  <div className="tab-content">
                    <pre className="json-viewer">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function JSONViewer({ data }) {
  return (
    <pre className="json-viewer">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default App;
