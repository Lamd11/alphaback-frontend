import { useState } from 'react';
import { runSimulation, getDefaultSimulationParams } from '../services/simulateService';
import './SimulationModal.css';

function SimulationModal({ model, onClose, onSimulationComplete }) {
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');
  const [params, setParams] = useState(getDefaultSimulationParams());
  const [symbolsInput, setSymbolsInput] = useState(getDefaultSimulationParams().symbols.join(', '));

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      setError('');

      const data = await runSimulation(model.model_id, params);

      // Pass results back and close modal
      onSimulationComplete(data, params.symbols);
      onClose();
    } catch (err) {
      console.error('Simulation error:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Simulation failed. Please try again.'
      );
      setSimulating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSymbolsChange = (value) => {
    // Store the raw input value
    setSymbolsInput(value);

    // Convert comma-separated string to array for params
    const symbols = value.split(',').map(s => s.trim()).filter(s => s);
    setParams(prev => ({
      ...prev,
      symbols
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Run Simulation</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="model-info">
            <p><strong>Model:</strong> {model.classPath || model.model_id}</p>
            <p><strong>Status:</strong> {model.verified ? '✓ Verified' : '✗ Not Verified'}</p>
          </div>

          <div className="simulation-params">
            <h3>Simulation Parameters</h3>

            <div className="param-group">
              <label>Start Date</label>
              <input
                type="date"
                value={params.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                disabled={simulating}
              />
            </div>

            <div className="param-group">
              <label>End Date</label>
              <input
                type="date"
                value={params.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                disabled={simulating}
              />
            </div>

            <div className="param-group">
              <label>Stock Symbols (comma-separated)</label>
              <input
                type="text"
                value={symbolsInput}
                onChange={(e) => handleSymbolsChange(e.target.value)}
                placeholder="AAPL, GOOGL, MSFT"
                disabled={simulating}
              />
            </div>

            <div className="param-group">
              <label>Time Step</label>
              <select
                value={params.timeStep}
                onChange={(e) => handleInputChange('timeStep', e.target.value)}
                disabled={simulating}
              >
                <option value="1d">Daily (1d)</option>
                <option value="1h">Hourly (1h)</option>
                <option value="1w">Weekly (1w)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={simulating}
          >
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSimulate}
            disabled={simulating || !model.verified}
          >
            {simulating ? 'Running Simulation...' : 'Run Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SimulationModal;
