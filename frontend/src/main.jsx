import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from './components/UserAuthContext';
import L from 'leaflet';

const rawBasename = (import.meta.env.VITE_ROUTER_BASENAME || '/').trim();
const configuredBasename = rawBasename === '/user' || rawBasename === '/user/'
  ? '/'
  : (rawBasename || '/');
const routerBasename = window.location.pathname.startsWith(configuredBasename)
  ? configuredBasename
  : '/';

if (configuredBasename !== '/' && (window.location.pathname === '/' || window.location.pathname === '')) {
  window.location.replace(`${configuredBasename}/login`);
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={routerBasename}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
