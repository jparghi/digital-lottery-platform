import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const buy = async () => {
    await fetch('/api/ticket/buy', { method: 'POST' });
    alert('Ticket purchased!');
  };
  return <button onClick={buy}>Buy Ticket</button>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
