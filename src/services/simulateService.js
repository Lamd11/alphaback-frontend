import axios from 'axios';

// TODO: Replace this with your actual simulate API endpoint
const SIMULATE_API_URL = import.meta.env.VITE_SIMULATE_API_URL || 'YOUR_SIMULATE_API_ENDPOINT_HERE';

/**
 * Run a simulation on a model
 * @param {string} modelId - The ID of the model to simulate
 * @param {Object} params - Simulation parameters
 * @param {string} params.startDate - Start date for simulation (e.g., "2023-01-01")
 * @param {string} params.endDate - End date for simulation (e.g., "2023-12-31")
 * @param {Array<string>} params.symbols - Stock symbols to simulate (e.g., ["AAPL", "GOOGL"])
 * @param {string} params.timeStep - Time step for simulation (e.g., "1d", "1h")
 * @returns {Promise<Object>} Simulation results
 */
export async function runSimulation(modelId, params) {
  console.log('Running simulation for model:', modelId);
  console.log('Simulation params:', params);
  console.log('API URL:', SIMULATE_API_URL);

  // Convert stocks array to comma-separated string
  const stocks = params.symbols.join(',').toLowerCase();

  // Build URL with query parameters
  const url = `${SIMULATE_API_URL}?stocks=${stocks}&modelId=${modelId}`;

  console.log('Full URL:', url);

  try {
    const response = await axios.post(url);

    console.log('Simulation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Simulation failed:', error);
    throw error;
  }
}

/**
 * Get default simulation parameters
 * You can customize these defaults
 */
export function getDefaultSimulationParams() {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return {
    startDate: oneYearAgo.toISOString().split('T')[0], // YYYY-MM-DD
    endDate: today.toISOString().split('T')[0],
    symbols: ['AAPL', 'GOOGL', 'MSFT'], // Default stocks
    timeStep: '1d' // Daily
  };
}
