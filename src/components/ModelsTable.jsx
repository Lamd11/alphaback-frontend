import { useState, useEffect } from 'react';
import { fetchModels, getModelName } from '../services/modelService';
import SimulationModal from './SimulationModal';
import './ModelsTable.css';

function ModelsTable() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchModels();
      setModels(data);
    } catch (err) {
      setError('Failed to load models. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (modelId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(modelId)) {
      newExpanded.delete(modelId);
    } else {
      newExpanded.add(modelId);
    }
    setExpandedRows(newExpanded);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusBadge = (verified) => {
    return verified ? (
      <span className="badge badge-success">Verified</span>
    ) : (
      <span className="badge badge-danger">Not Verified</span>
    );
  };

  const handleSimulateClick = (model) => {
    setSelectedModel(model);
  };

  const closeModal = () => {
    setSelectedModel(null);
  };

  if (loading) {
    return (
      <div className="models-loading">
        <div className="spinner"></div>
        <p>Loading models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="models-error">
        <p>{error}</p>
        <button onClick={loadModels} className="btn btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="models-empty">
        <p>No models uploaded yet. Upload your first model to get started!</p>
      </div>
    );
  }

  return (
    <div className="models-table-container">
      <div className="models-header">
        <h2>Your Financial Models</h2>
        <button onClick={loadModels} className="btn-refresh" title="Refresh">
          ↻
        </button>
      </div>

      <div className="table-wrapper">
        <table className="models-table">
          <thead>
            <tr>
              <th></th>
              <th>Model Name</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Execution Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => {
              const isExpanded = expandedRows.has(model.model_id);
              return (
                <>
                  <tr key={model.model_id} className="model-row">
                    <td>
                      <button
                        className="expand-btn"
                        onClick={() => toggleRow(model.model_id)}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </td>
                    <td className="model-name">
                      <strong>{getModelName(model)}</strong>
                      <div className="model-id-small">{model.model_id}</div>
                    </td>
                    <td>{getStatusBadge(model.verified)}</td>
                    <td>{formatTimestamp(model.timestamp)}</td>
                    <td>{model.executionTimeMs ? `${model.executionTimeMs}ms` : 'N/A'}</td>
                    <td>
                      <button
                        className="btn-action btn-simulate"
                        onClick={() => handleSimulateClick(model)}
                        disabled={!model.verified}
                        title={model.verified ? 'Run simulation' : 'Model must be verified first'}
                      >
                        Simulate
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="expanded-row">
                      <td colSpan="6">
                        <div className="expanded-content">
                          <div className="detail-section">
                            <h4>Model Details</h4>
                            <div className="detail-grid">
                              <div className="detail-item">
                                <span className="detail-label">Model ID:</span>
                                <code className="detail-value">{model.model_id}</code>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Class Path:</span>
                                <code className="detail-value">{model.classPath || 'N/A'}</code>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">S3 Key:</span>
                                <code className="detail-value">{model.s3_key}</code>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">S3 Bucket:</span>
                                <code className="detail-value">{model.s3_bucket || 'N/A'}</code>
                              </div>
                            </div>
                          </div>

                          {model.parsedReport && (
                            <div className="detail-section">
                              <h4>Verification Report</h4>
                              <div className="checks-grid">
                                {Object.entries(model.parsedReport.checks || {}).map(([checkName, checkData]) => (
                                  <div key={checkName} className="check-item">
                                    <span className={`check-icon ${checkData.passed ? 'check-pass' : 'check-fail'}`}>
                                      {checkData.passed ? '✓' : '✗'}
                                    </span>
                                    <span className="check-name">
                                      {checkName.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {model.parsedReport.overallErrors && model.parsedReport.overallErrors.length > 0 && (
                                <div className="errors-section">
                                  <h5>Errors:</h5>
                                  <ul>
                                    {model.parsedReport.overallErrors.map((error, idx) => (
                                      <li key={idx}>{error}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedModel && (
        <SimulationModal model={selectedModel} onClose={closeModal} />
      )}
    </div>
  );
}

export default ModelsTable;
