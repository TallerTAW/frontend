import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import '../styles/leaflet.css'; 

// Crear icono personalizado
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #00BFFF;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(0, 191, 255, 0.7);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

// Componente para manejar clics en el mapa
function MapClickHandler({ onLocationSelect }) {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

// Componente para mover el mapa a una ubicación
function MapZoomToLocation({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position && map) {
      map.setView(position, 15); // Zoom a nivel 15
    }
  }, [position, map]);
  
  return null;
}

// Componente para el geocoder (versión simplificada)
function GeocoderControl({ onLocationSelect }) {
  const map = useMapEvents({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=bo`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error buscando ubicación:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    // Agregar control de búsqueda al mapa
    const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-geocoder');
    
    const input = L.DomUtil.create('input', 'leaflet-control-geocoder-form', container);
    input.type = 'text';
    input.placeholder = 'Buscar dirección en La Paz...';
    input.value = searchQuery;
    input.style.cssText = `
      width: 250px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
    `;
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch(e.target.value);
      }
    });
    
    const searchButton = L.DomUtil.create('button', 'leaflet-control-geocoder-icon', container);
    searchButton.innerHTML = '🔍';
    searchButton.style.cssText = `
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      background: #00BFFF;
      border: none;
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    `;
    
    searchButton.addEventListener('click', () => handleSearch(input.value));
    
    // Agregar control al mapa
    L.control({ position: 'topleft' }).onAdd = () => container;
    
    // Cleanup
    return () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [searchQuery, onLocationSelect]);

  // Manejar selección de resultado
  const handleResultSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    onLocationSelect(lat, lon, result.display_name);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <>
      {searchResults.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          maxWidth: '300px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {searchResults.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultSelect(result)}
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: 'bold' }}>
                {result.display_name.split(',')[0]}
              </div>
              <div style={{ color: '#666', fontSize: '11px' }}>
                {result.display_name.split(',').slice(1, 3).join(',')}
              </div>
            </div>
          ))}
        </div>
      )}
      {isSearching && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          Buscando...
        </div>
      )}
    </>
  );
}

export default function MapSelector({ 
  lat, 
  lon, 
  onChange,
  height = 400,
  readOnly = false
}) {
  const [position, setPosition] = useState(lat && lon ? [lat, lon] : [-16.5000, -68.1193]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [zoomToPosition, setZoomToPosition] = useState(null);

  // Coordenadas por defecto para La Paz, Bolivia
  const LA_PAZ_CENTER = [-16.5000, -68.1193];
  
  // Función para obtener dirección desde coordenadas
  const getAddressFromCoords = useCallback(async (latitude, longitude) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener dirección');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        let displayAddress = data.display_name;
        
        // Acortar dirección si es muy larga
        if (displayAddress.length > 100) {
          const parts = displayAddress.split(',');
          displayAddress = parts.slice(0, 3).join(', ') + '...';
        }
        
        setAddress(displayAddress);
        return displayAddress;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para buscar ubicación
  const handleSearchLocation = async (query) => {
    if (!query.trim()) {
      toast('Por favor ingresa una dirección para buscar');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=bo`
      );
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const firstResult = data[0];
        const newLat = parseFloat(firstResult.lat);
        const newLon = parseFloat(firstResult.lon);
        const newAddress = firstResult.display_name;
        
        const newPosition = [newLat, newLon];
        setPosition(newPosition);
        setZoomToPosition(newPosition); // Establecer posición para zoom
        setAddress(newAddress);
        onChange(newLat, newLon, newAddress);
        
        toast(`Ubicación encontrada: ${newAddress}`);
      } else {
        toast('No se encontraron resultados para esa búsqueda');
      }
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      toast('Error al buscar la ubicación');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar selección de ubicación
  const handleLocationSelect = useCallback(async (latitude, longitude, customAddress = null) => {
    const newPosition = [latitude, longitude];
    setPosition(newPosition);
    setZoomToPosition(newPosition); // Establecer posición para zoom
    
    let newAddress = customAddress;
    if (!customAddress) {
      newAddress = await getAddressFromCoords(latitude, longitude);
    }
    
    setAddress(newAddress || '');
    onChange(latitude, longitude, newAddress);
  }, [getAddressFromCoords, onChange]);

  // Función para usar ubicación actual
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast('La geolocalización no está soportada por tu navegador');
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await handleLocationSelect(lat, lon);
        setLoading(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        toast('No se pudo obtener tu ubicación. Verifica los permisos.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [handleLocationSelect]);

  // Efecto para actualizar cuando cambian las props
  useEffect(() => {
    if (lat && lon && (lat !== position[0] || lon !== position[1])) {
      const newPosition = [lat, lon];
      setPosition(newPosition);
      setZoomToPosition(newPosition); // Establecer posición para zoom
      if (!address) {
        getAddressFromCoords(lat, lon);
      }
    }
  }, [lat, lon, address, position, getAddressFromCoords]);

  return (
    <div style={{ width: '100%' }}>
      {/* Barra de búsqueda manual */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '15px',
        flexDirection: window.innerWidth < 600 ? 'column' : 'row'
      }}>
        <input
          type="text"
          placeholder="Buscar dirección en La Paz, Bolivia..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              handleSearchLocation(e.target.value.trim());
            }
          }}
          style={{
            flex: 1,
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border 0.3s'
          }}
        />
        <button
          onClick={() => handleSearchLocation(searchInput)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#A2E831',
            color: '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            minWidth: 'fit-content'
          }}
          disabled={loading || readOnly || !searchInput.trim()}
        >
          🔍 Buscar
        </button>
      </div>

      {/* Mapa */}
      <div style={{ 
        position: 'relative',
        height: `${height}px`,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid #00BFFF',
        boxShadow: '0 4px 20px rgba(0, 191, 255, 0.15)'
      }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            borderRadius: '12px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #00BFFF',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }} />
              <p style={{ color: '#333', fontWeight: 'bold' }}>Cargando...</p>
            </div>
          </div>
        )}

        <MapContainer
          center={position}
          zoom={13}
          style={{ 
            height: '100%', 
            width: '100%',
            cursor: readOnly ? 'default' : 'crosshair'
          }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Componente para hacer zoom a ubicación */}
          {zoomToPosition && <MapZoomToLocation position={zoomToPosition} />}
          
          <GeocoderControl onLocationSelect={handleLocationSelect} />
          
          {!readOnly && (
            <MapClickHandler onLocationSelect={handleLocationSelect} />
          )}
          
          <Marker 
            position={position} 
            icon={createCustomIcon()}
            draggable={!readOnly}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                handleLocationSelect(position.lat, position.lng);
              }
            }}
          >
            <Popup>
              <div style={{ padding: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#00BFFF' }}>
                  📍 Ubicación seleccionada
                </h4>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  <strong>Latitud:</strong> {position[0].toFixed(6)}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  <strong>Longitud:</strong> {position[1].toFixed(6)}
                </p>
                {address && (
                  <p style={{ 
                    margin: '10px 0 0 0', 
                    fontSize: '11px',
                    color: '#666',
                    borderTop: '1px solid #eee',
                    paddingTop: '5px'
                  }}>
                    {address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Información de coordenadas */}
      <div style={{
        marginTop: '15px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
              📍 Coordenadas seleccionadas
            </h4>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
              <strong>Latitud:</strong> {position[0].toFixed(6)}
            </p>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
              <strong>Longitud:</strong> {position[1].toFixed(6)}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${position[0].toFixed(6)}, ${position[1].toFixed(6)}`);
              toast('Coordenadas copiadas al portapapeles');
            }}
            style={{
              padding: '8px 15px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            📋 Copiar
          </button>
        </div>
        
        {address && (
          <div style={{ 
            marginTop: '10px', 
            paddingTop: '10px',
            borderTop: '1px solid #e9ecef'
          }}>
            <p style={{ margin: '0 0 5px 0', color: '#333', fontSize: '13px' }}>
              <strong>Dirección detectada:</strong>
            </p>
            <p style={{ 
              margin: '0', 
              color: '#666', 
              fontSize: '12px',
              fontStyle: 'italic',
              lineHeight: '1.4'
            }}>
              {address}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          border-color: #00BFFF !important;
          box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.2) !important;
        }
        
        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .leaflet-control-geocoder {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1000;
        }
        
        .leaflet-control-geocoder-form input {
          width: 250px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
        }
        
        .leaflet-control-geocoder-icon {
          background-color: #00BFFF;
          border: none;
          color: white;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}