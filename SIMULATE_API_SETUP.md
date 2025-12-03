# Simulate API Integration Setup

## Quick Start

When your colleague gives you the Simulate API endpoint, follow these steps:

### 1. Add the API Endpoint

Open `.env` and replace the placeholder:

```bash
VITE_SIMULATE_API_URL=https://your-actual-simulate-api-url.amazonaws.com/endpoint
```

### 2. Restart Dev Server

After updating `.env`, restart your dev server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 3. Test It

1. Go to `http://localhost:3000/models`
2. Click the **Simulate** button on any verified model
3. A modal will appear with simulation parameters
4. Adjust parameters and click **Run Simulation**

---

## Where the Code Lives

### API Service
**File:** `src/services/simulateService.js`

This is where the API call happens:

```javascript
export async function runSimulation(modelId, params) {
  const response = await axios.post(SIMULATE_API_URL, {
    modelId: modelId,
    ...params
  });
  return response.data;
}
```

### Simulation Modal
**File:** `src/components/SimulationModal.jsx`

This handles:
- Collecting simulation parameters (dates, stocks, time step)
- Calling the API
- Displaying raw results

### Models Table
**File:** `src/components/ModelsTable.jsx`

The "Simulate" buttons call `handleSimulateClick()` which opens the modal.

---

## Expected API Format

### Request
Your frontend sends:

```json
{
  "modelId": "7f869bf2-eabb-4ef8-9cfe-578f4fb16e32",
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "symbols": ["AAPL", "GOOGL", "MSFT"],
  "timeStep": "1d"
}
```

### Response
The frontend will display whatever JSON your API returns. Example:

```json
{
  "simulationId": "sim-123",
  "results": {
    "gain": 12500.50,
    "loss": -3200.25,
    "decisions": [...],
    "performance": {...}
  }
}
```

The results will be displayed as **raw JSON** in a dark code block for now. You can format it later once you know the exact structure.

---

## Customizing Default Parameters

Edit `src/services/simulateService.js`:

```javascript
export function getDefaultSimulationParams() {
  return {
    startDate: '2023-01-01',  // Change default start date
    endDate: '2023-12-31',    // Change default end date
    symbols: ['AAPL', 'TSLA'], // Change default stocks
    timeStep: '1d'             // Change default time step
  };
}
```

---

## Need to Change the Request Format?

If your colleague's API expects a different format, edit:

`src/services/simulateService.js` line 20:

```javascript
const response = await axios.post(SIMULATE_API_URL, {
  // Modify this object to match your API's expected format
  modelId: modelId,
  ...params
});
```

---

## Debugging

Check browser console (F12) for:
- API URL being called
- Request payload
- Response data
- Any errors

All are logged in `simulateService.js`!
