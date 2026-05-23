import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const VEHICLES = ['V-001', 'V-002', 'V-003', 'V-004', 'V-005'];

// Varanasi center coordinates
const CENTER = [25.3176, 82.9739];

function randomOffset() {
  return (Math.random() - 0.5) * 0.05;
}

function App() {
  const [vehicles, setVehicles] = useState({});
  const [logs, setLogs] = useState([]);

  const sendPing = async (vehicleId) => {
    const lat = CENTER[0] + randomOffset();
    const lng = CENTER[1] + randomOffset();
    const speed = Math.floor(Math.random() * 80) + 10;

    try {
      await axios.post('http://localhost:8082/api/location/ping', {
        vehicleId, latitude: lat, longitude: lng, speed
      });

      setVehicles(prev => ({ ...prev, [vehicleId]: { lat, lng, speed } }));
      setLogs(prev => [`${vehicleId} → ${lat.toFixed(4)}, ${lng.toFixed(4)} @ ${speed}km/h`, ...prev.slice(0, 9)]);
    } catch (err) {
      setLogs(prev => [`ERROR: ${err.message}`, ...prev.slice(0, 9)]);
    }
  };

  useEffect(() => {
    // Send initial pings
    VEHICLES.forEach(v => sendPing(v));

    // Send pings every 5 seconds
    const interval = setInterval(() => {
      VEHICLES.forEach(v => sendPing(v));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', background: '#1a1a2e', color: 'white', padding: '20px', overflowY: 'auto' }}>
        <h2 style={{ color: '#00d4ff', marginBottom: '10px' }}>🚛 FleetPulse</h2>
        <p style={{ color: '#888', fontSize: '12px' }}>Live Vehicle Tracking</p>
        <hr style={{ borderColor: '#333', margin: '15px 0' }} />

        <h3 style={{ color: '#00d4ff', fontSize: '14px' }}>ACTIVE VEHICLES</h3>
        {VEHICLES.map(v => (
          <div key={v} style={{ background: '#16213e', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
            <div style={{ color: '#00d4ff', fontWeight: 'bold' }}>{v}</div>
            {vehicles[v] && (
              <>
                <div style={{ fontSize: '12px', color: '#aaa' }}>
                  {vehicles[v].lat.toFixed(4)}, {vehicles[v].lng.toFixed(4)}
                </div>
                <div style={{ fontSize: '12px', color: '#00ff88' }}>
                  {vehicles[v].speed} km/h
                </div>
              </>
            )}
          </div>
        ))}

        <hr style={{ borderColor: '#333', margin: '15px 0' }} />
        <h3 style={{ color: '#00d4ff', fontSize: '14px' }}>LIVE LOGS</h3>
        {logs.map((log, i) => (
          <div key={i} style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{log}</div>
        ))}
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapContainer center={CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {Object.entries(vehicles).map(([id, pos]) => (
            <Marker key={id} position={[pos.lat, pos.lng]}>
              <Popup>
                <b>{id}</b><br />
                Speed: {pos.speed} km/h<br />
                Lat: {pos.lat.toFixed(4)}<br />
                Lng: {pos.lng.toFixed(4)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;