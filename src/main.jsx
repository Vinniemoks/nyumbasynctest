import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '../public/css/style.css'; // Assuming this is your main CSS file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);