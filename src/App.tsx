import React, { useMemo, useState } from "react";
import WeighInCandlestick from "./components/WeighInCandlestick";
import { sampleWeighIns } from "./data/sampleWeighIns";
import { transformWeighIns } from "./lib/weighInTransform";

const defaultInput = JSON.stringify(sampleWeighIns, null, 2);

const App: React.FC = () => {
  const [input, setInput] = useState(defaultInput);
  const result = useMemo(() => transformWeighIns(input), [input]);

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>Weigh-In Candlestick</h1>
          <p>Compare morning vs night weigh-ins and track trends over time.</p>
        </div>
        <div className="legend">
          <span className="legend-item">Open = Morning</span>
          <span className="legend-item">Close = Night</span>
        </div>
      </header>

      <section className="panel">
        <label htmlFor="weighin-input">Weigh-in data (JSON array)</label>
        <textarea
          id="weighin-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={12}
          spellCheck={false}
        />
        {result.errors.length > 0 && (
          <div className="message error">
            <strong>Fix these issues:</strong>
            <ul>
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {result.errors.length === 0 && result.warnings.length > 0 && (
          <div className="message warning">
            <strong>Warnings:</strong>
            <ul>
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="panel">
        {result.errors.length === 0 ? (
          <WeighInCandlestick candles={result.candles} summary={result.summary} />
        ) : (
          <div className="empty-state">Enter valid data to render the chart.</div>
        )}
      </section>
    </main>
  );
};

export default App;
