//App.js

import React, { useState } from 'react';
import QrScanner from './components/QrScanner';

function App() {
  const [lastScan, setLastScan] = useState('');

  return (
    <div className="App">
      <h1>QRcode 掃描範例</h1>
      <QrScanner onScanSuccess={(result) => setLastScan(result.toString())} />
      <p>掃到的結果: {lastScan || '尚未掃描'}</p>
    </div>
  );
}

export default App;
