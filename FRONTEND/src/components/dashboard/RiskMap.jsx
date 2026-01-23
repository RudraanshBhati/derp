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

// Get color based on status
const getStatusColor = (status) => {
    if (status === 'Critical') return '#ef4444'; // red-500
    if (status === 'Warning') return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
};

export default function RiskMap({ data, loading }) {
  if (loading) {
    return <div className="h-[400px] bg-secondary rounded-xl animate-pulse flex items-center justify-center text-muted-foreground">Loading Map Data...</div>;
  }

  // Haryana center coords (since our data is from Haryana)
  const position = [29.0588, 76.0856]; 

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm h-[400px] relative z-0">
      <div className="absolute top-4 left-4 z-[400] bg-card/90 backdrop-blur p-3 rounded-lg shadow border">
        <div className="font-semibold mb-1 text-sm">Haryana Districts</div>
        <div className="text-xs text-muted-foreground">{data.length} locations monitored</div>
      </div>

      <div className="absolute top-4 right-4 z-[400] bg-card/90 backdrop-blur p-2 rounded-lg shadow border text-xs">
        <div className="font-semibold mb-2">Groundwater Risk</div>
        <div className="flex items-center gap-2 mb-1"><span className="block w-3 h-3 rounded-full bg-red-500"></span> Critical</div>
        <div className="flex items-center gap-2 mb-1"><span className="block w-3 h-3 rounded-full bg-yellow-500"></span> Warning</div>
        <div className="flex items-center gap-2"><span className="block w-3 h-3 rounded-full bg-green-500"></span> Safe</div>
      </div>
      
      <MapContainer center={position} zoom={8} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((district) => (
          <Circle
            key={district.id}
            center={[district.lat, district.lng]}
            pathOptions={{ 
                color: getStatusColor(district.status),
                fillColor: getStatusColor(district.status),
                fillOpacity: 0.5
            }}
            radius={5000} // Radius in meters (adjusted for Haryana scale)
          >
            <Popup>
              <div className="p-1 min-w-[180px]">
                 <h3 className="font-bold text-sm mb-1">{district.name}</h3>
                 <p className="text-xs text-gray-600 mb-2">{district.village}, {district.block}</p>
                 <div className="space-y-1">
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-600">Status:</span>
                     <span className={`font-semibold ${
                       district.status === 'Critical' ? 'text-red-600' :
                       district.status === 'Warning' ? 'text-yellow-600' : 
                       'text-green-600'
                     }`}>{district.status}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-600">Current Level:</span>
                     <span className="font-semibold">{district.level}m</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-600">Predicted:</span>
                     <span className="font-semibold">{district.predictedLevel}m</span>
                   </div>
                   <div className="flex justify-between text-xs">
                     <span className="text-gray-600">RMSE:</span>
                     <span className="font-mono">{district.rmse}</span>
                   </div>
                 </div>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
