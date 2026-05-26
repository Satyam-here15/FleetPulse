import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Red icon for speeding vehicles
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const VEHICLES = ['V-001', 'V-002', 'V-003', 'V-004', 'V-005',
                  'V-006', 'V-007', 'V-008', 'V-009', 'V-010'];
const CENTER = [25.3176, 82.9739];
const SPEED_LIMIT = 80;

function randomOffset() {
  return (Math.random() - 0.5) * 0.05;
}

function App() {
  const [vehicles, setVehicles] = useState({});
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [speedingVehicles, setSpeedingVehicles] = useState(new Set());

  const sendPing = async (vehicleId) => {
    const lat = CENTER[0] + randomOffset();
    const lng = CENTER[1] + randomOffset();
    const speed = Math.floor(Math.random() * 100) + 10;

    try {
      await axios.post('http://localhost:8082/api/location/ping', {
        vehicleId, latitude: lat, longitude: lng, speed
      });

      setVehicles(prev => ({ ...prev, [vehicleId]: { lat, lng, speed } }));
      setLogs(prev => [`${vehicleId} → ${lat.toFixed(4)}, ${lng.toFixed(4)} @ ${speed}km/h`, ...prev.slice(0, 9)]);

      // Check speed alert
      if (speed > SPEED_LIMIT) {
        const alert = `🚨 ${vehicleId} speeding at ${speed} km/h!`;
        setAlerts(prev => [{ id: Date.now(), message: alert, vehicleId }, ...prev.slice(0, 4)]);
        setSpeedingVehicles(prev => new Set([...prev, vehicleId]));
        // Remove red marker after 10 seconds
        setTimeout(() => {
          setSpeedingVehicles(prev => {
            const next = new Set(prev);
            next.delete(vehicleId);
            return next;
          });
        }, 10000);
      }
    } catch (err) {
      setLogs(prev => [`ERROR: ${err.message}`, ...prev.slice(0, 9)]);
    }
  };

  useEffect(() => {
    VEHICLES.forEach(v => sendPing(v));
    const interval = setInterval(() => {
      VEHICLES.forEach(v => sendPing(v));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', background: '#1a1a2e', color: 'white', padding: '20px', overflowY: 'auto' }}>
        <h2 style={{ color: '#00d4ff', marginBottom: '5px' }}>🚛 FleetPulse</h2>
        <p style={{ color: '#888', fontSize: '12px' }}>Live Vehicle Tracking</p>
        <hr style={{ borderColor: '#333', margin: '15px 0' }} />

        {/* Speed Alerts Panel */}
        {alerts.length > 0 && (
          <>
            <h3 style={{ color: '#ff4444', fontSize: '14px' }}>🚨 SPEED ALERTS</h3>
            {alerts.map(alert => (
              <div key={alert.id} style={{
                background: '#2d0000',
                border: '1px solid #ff4444',
                borderRadius: '8px',
                padding: '8px',
                marginBottom: '6px',
                fontSize: '12px',
                color: '#ff6666'
              }}>
                {alert.message}
              </div>
            ))}
            <hr style={{ borderColor: '#333', margin: '15px 0' }} />
          </>
        )}

        <h3 style={{ color: '#00d4ff', fontSize: '14px' }}>ACTIVE VEHICLES</h3>
        {VEHICLES.map(v => (
          <div key={v} style={{
            background: speedingVehicles.has(v) ? '#2d0000' : '#16213e',
            border: speedingVehicles.has(v) ? '1px solid #ff4444' : 'none',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '8px'
          }}>
            <div style={{ color: speedingVehicles.has(v) ? '#ff4444' : '#00d4ff', fontWeight: 'bold' }}>
              {speedingVehicles.has(v) ? '🚨 ' : ''}{v}
            </div>
            {vehicles[v] && (
              <>
                <div style={{ fontSize: '12px', color: '#aaa' }}>
                  {vehicles[v].lat.toFixed(4)}, {vehicles[v].lng.toFixed(4)}
                </div>
                <div style={{ fontSize: '12px', color: vehicles[v].speed > SPEED_LIMIT ? '#ff4444' : '#00ff88' }}>
                  {vehicles[v].speed} km/h {vehicles[v].speed > SPEED_LIMIT ? '⚠️' : ''}
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
            <Marker
              key={id}
              position={[pos.lat, pos.lng]}
              icon={speedingVehicles.has(id) ? redIcon : new L.Icon.Default()}
            >
              <Popup>
                <b style={{ color: speedingVehicles.has(id) ? 'red' : 'black' }}>
                  {speedingVehicles.has(id) ? '🚨 ' : ''}{id}
                </b><br />
                Speed: <b style={{ color: pos.speed > SPEED_LIMIT ? 'red' : 'green' }}>
                  {pos.speed} km/h
                </b><br />
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