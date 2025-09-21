import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 VibeFM: Starting React application...');
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('📡 API Base URL:', import.meta.env.VITE_API_BASE_URL);

try {
  const rootElement = document.getElementById('root');
  console.log('📦 Root element:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  console.log('✅ VibeFM: React application started successfully');
} catch (error) {
  console.error('❌ VibeFM: Failed to start React application:', error);
}
