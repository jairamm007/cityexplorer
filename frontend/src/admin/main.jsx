import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import App from './App';
import { AdminAuthProvider } from './components/AuthContext';
import './index.css';

const configuredBasename = import.meta.env.VITE_ROUTER_BASENAME || '/admin';
const routerBasename = window.location.pathname.startsWith(configuredBasename)
  ? configuredBasename
  : '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={routerBasename}>
      <AdminAuthProvider>
        <App />
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);