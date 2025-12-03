import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import './SimulationResults.css';

function SimulationResults({ results, stocks }) {
  if (!results) return null;

  const { status, gainPercentage, startingCapital, endingCapital, decisions } = results;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const isProfit = gainPercentage >= 0;

  // Prepare chart data - simulate portfolio value over time
  const prepareChartData = () => {
    // Get unique dates from decisions
    const uniqueDates = [...new Set(decisions.map(d => d.date))].sort();

    if (uniqueDates.length === 0) return [];

    // Create data points showing linear progression from start to end capital
    const step = (endingCapital - startingCapital) / (uniqueDates.length - 1 || 1);

    return uniqueDates.map((date, idx) => {
      const value = startingCapital + (step * idx);

      // Count trading activity on this date
      const dayDecisions = decisions.filter(d => d.date === date);
      const buys = dayDecisions.filter(d => d.isBuy).length;
      const sells = dayDecisions.filter(d => d.isBuy === false).length;

      return {
        date: date,
        value: value,
        buys: buys,
        sells: sells,
        activity: buys + sells
      };
    });
  };

  const chartData = prepareChartData();

  return (
    <div className="simulation-results">
      <div className="results-header">
        <h2>Simulation Results</h2>
        {stocks && (
          <div className="stocks-simulated">
            <span>Stocks: </span>
            {stocks.map((stock, idx) => (
              <span key={idx} className="stock-badge">
                {stock.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="performance-summary">
        <div className="summary-card">
          <div className="summary-label">Starting Capital</div>
          <div className="summary-value">{formatCurrency(startingCapital)}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Ending Capital</div>
          <div className="summary-value">{formatCurrency(endingCapital)}</div>
        </div>

        <div className={`summary-card gain-card ${isProfit ? 'profit' : 'loss'}`}>
          <div className="summary-label">Gain/Loss</div>
          <div className="summary-value gain-value">
            {formatPercentage(gainPercentage)}
            <div className="gain-amount">
              {formatCurrency(endingCapital - startingCapital)}
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Total Decisions</div>
          <div className="summary-value">{decisions.length}</div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Portfolio Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isProfit ? "#10b981" : "#ef4444"} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={isProfit ? "#10b981" : "#ef4444"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value, name) => {
                if (name === 'value') return [formatCurrency(value), 'Portfolio Value'];
                if (name === 'buys') return [value, 'Buys'];
                if (name === 'sells') return [value, 'Sells'];
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isProfit ? "#10b981" : "#ef4444"}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="activity-legend">
          <div className="legend-item">
            <span className="legend-dot buy-dot"></span>
            <span>Total Buy Actions: {decisions.filter(d => d.isBuy).length}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot sell-dot"></span>
            <span>Total Sell Actions: {decisions.filter(d => !d.isBuy).length}</span>
          </div>
        </div>
      </div>

      <div className="decisions-section">
        <h3>Trading Decisions</h3>

        <div className="decisions-table-wrapper">
          <table className="decisions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Stock</th>
                <th>Action</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((decision, idx) => (
                <tr key={idx} className={decision.isBuy ? 'buy-row' : 'sell-row'}>
                  <td>{decision.date}</td>
                  <td className="stock-cell">
                    <span className="stock-symbol">{decision.stock.toUpperCase()}</span>
                  </td>
                  <td>
                    <span className={`action-badge ${decision.isBuy ? 'buy' : 'sell'}`}>
                      {decision.isBuy ? '📈 BUY' : '📉 SELL'}
                    </span>
                  </td>
                  <td className="amount-cell">{decision.amount} shares</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SimulationResults;
