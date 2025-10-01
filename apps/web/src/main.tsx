import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error boundary wrapper
const AppWithErrorBoundary = () => {
  try {
    return <App />;
  } catch (error) {
    console.error('App crashed:', error);
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h1 style={{ color: '#000', marginBottom: '10px' }}>Indara</h1>
          <p style={{ color: '#666' }}>Loading your healing journey...</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#000',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
};

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <AppWithErrorBoundary />
  </StrictMode>
);