import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Fix Leaflet's default icon path issues
import L from 'leaflet';

// Fix for default markers in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Function to determine color based on risk
const getRiskColor = (risk) => {
    if (risk > 75) return '#ef4444'; // red-500
    if (risk > 50) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
};

export default function RiskMap({ data, loading }) {
  if (loading) {
    return <div className="h-[400px] bg-secondary rounded-xl animate-pulse flex items-center justify-center text-muted-foreground">Loading Map Data...</div>;
  }

  // India center coords
  const position = [20.5937, 78.9629]; 

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm h-[400px] relative z-0">
      <div className="absolute top-4 right-4 z-[400] bg-card/90 backdrop-blur p-2 rounded-lg shadow border text-xs">
        <div className="font-semibold mb-2">Groundwater Risk</div>
        <div className="flex items-center gap-2 mb-1"><span className="block w-3 h-3 rounded-full bg-red-500"></span> Critical ({'>'}75%)</div>
        <div className="flex items-center gap-2 mb-1"><span className="block w-3 h-3 rounded-full bg-yellow-500"></span> Warning (50-75%)</div>
        <div className="flex items-center gap-2"><span className="block w-3 h-3 rounded-full bg-green-500"></span> Safe (&lt;50%)</div>
      </div>
      
      <MapContainer center={position} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((district) => (
          <Circle
            key={district.id}
            center={[district.lat, district.lng]}
            pathOptions={{ 
                color: getRiskColor(district.risk),
                fillColor: getRiskColor(district.risk),
                fillOpacity: 0.6
            }}
            radius={80000} // Radius in meters
          >
            <Popup>
              <div className="p-1">
                 <h3 className="font-bold text-sm">{district.name}</h3>
                 <p className="text-xs">Risk: <span className="font-semibold">{district.risk}%</span></p>
                 <p className="text-xs">Level: <span className="font-semibold">{district.level}m</span></p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
