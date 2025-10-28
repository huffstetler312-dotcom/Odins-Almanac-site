import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🛡️ Odin's Almanac</h1>
        <p>Revolutionary AI-Powered Food Safety Platform</p>
        <button onClick={async () => {
          try {
            const resp = await fetch('/api/stripe/create-checkout-session', { method: 'POST' });
            const data = await resp.json();
            if (data?.url) window.location = data.url;
            else alert('Checkout failed (no URL). Check server logs.');
          } catch (e) {
            alert('Network error. Server may not be running.');
          }
        }}>
          Start Subscription
        </button>
      </header>
    </div>
  );
}

export default App;
