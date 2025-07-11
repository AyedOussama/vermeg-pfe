import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { CssBaseline } from '@mui/material';
import { MuiWrapper } from './components/common/MuiWrapper';
import { ThemeProvider } from './context/ThemeProvider';
import { store, persistor } from './store/store';
import App from './App';
import './assets/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}>
            Loading...
          </div>
        }
        persistor={persistor}
      >
        <BrowserRouter>
          <MuiWrapper>
            <CssBaseline />
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </MuiWrapper>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);