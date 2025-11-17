import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { enforceHTTPS } from './utils/secureHeaders';
import { setupCSPReporting } from './utils/contentSecurityPolicy';

// Enforce HTTPS in production
enforceHTTPS();

// Set up CSP violation reporting
setupCSPReporting();

// Security initialization
if (import.meta.env.VITE_ENVIRONMENT === 'production') {
  // Disable console in production
  if (import.meta.env.VITE_ENABLE_DEBUG_MODE !== 'true') {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
  }
  
  // Disable right-click in production (optional - can be annoying for users)
  // document.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Disable text selection for sensitive areas (optional)
  // document.addEventListener('selectstart', (e) => {
  //   if (e.target.classList.contains('no-select')) {
  //     e.preventDefault();
  //   }
  // });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
