import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// 커스텀 마커 아이콘 (전쟁/사건 느낌)
const createCustomIcon = (isSelected) => {
  return L.divIcon({
    html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${isSelected ? 'bg-blue-600 scale-150 z-50' : 'bg-red-500 opacity-80'}"></div>`,
    className: 'custom-div-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// 지도를 부드럽게 이동시키는 컨트롤러
function MapController({ selectedEvent }) {
  const map = useMap();
  useEffect(() => {
    if (selectedEvent) {
      const { coordinates } = selectedEvent.location;
      map.flyTo([coordinates[1], coordinates[0]], 8, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedEvent, map]);
  return null;
}

const HistoryMap = ({ events, selectedEvent, dark, onMarkerClick }) => {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[36, 127]}
        zoom={5}
        zoomControl={false}
        className="w-full h-full outline-none"
      >
        <TileLayer
          // README 명세: 심플한 CartoDB 스타일
          url={dark 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          polygonOptions={{
            fillColor: '#3b82f6',
            color: '#3b82f6',
            weight: 1,
            opacity: 0.5,
            fillOpacity: 0.1,
          }}
        >
          {events.map((event) => (
            <Marker
              key={event._id}
              position={[event.location.coordinates[1], event.location.coordinates[0]]}
              icon={createCustomIcon(selectedEvent && selectedEvent._id === event._id)}
              eventHandlers={{
                click: () => onMarkerClick(event),
              }}
            />
          ))}
        </MarkerClusterGroup>

        <MapController selectedEvent={selectedEvent} />
      </MapContainer>

      {/* 지도 스타일을 위한 커스텀 CSS (마커 반전 등) */}
      <style>{`
        .leaflet-container {
          background: ${dark ? '#0f172a' : '#f8fafc'} !important;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
        }
        .leaflet-marker-icon {
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default HistoryMap;
