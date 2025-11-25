import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';

// fijar icon por defecto (por la forma en que leaflet carga assets)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/node_modules/leaflet/dist/images/marker-icon-2x.png',
  iconUrl: '/node_modules/leaflet/dist/images/marker-icon.png',
  shadowUrl: '/node_modules/leaflet/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });
  return position ? <Marker position={position} /> : null;
}

export default function MapSelector({ lat, lon, onChange }) {
  const center = lat && lon ? [lat, lon] : [-16.5, -68.15]; // tu default
  const [position, setPosition] = useState(lat && lon ? [lat, lon] : null);

  // Propagar cambios al padre
  if (position && (position[0] !== lat || position[1] !== lon)) {
    onChange(position[0], position[1]);
  }

  return (
    <MapContainer center={center} zoom={13} style={{ height: 300, width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  );
}
