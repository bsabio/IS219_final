import React from 'react';
import './App.css';
import CombinedLineChart from './components/CombinedLineChart';

function App() {
  return (
    <div className="App">
      <main className="App-header">
        <h1>Depression Rates vs. Digital Media Usage</h1>
        <CombinedLineChart />
      </main>
    </div>
  );
}

export default App;