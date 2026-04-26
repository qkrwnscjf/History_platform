import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";

// 가장 낮은 해상도(110m)를 유지하여 심플함을 극대화
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const HistoryMap = ({ events, selectedEvent, dark, onMarkerClick }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <ComposableMap
        // scale을 200에서 140으로 줄여 지도를 더 작고 심플하게 표현 (해상도 밀도 조절)
        projectionConfig={{ scale: 140, center: [0, 0] }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup 
          center={selectedEvent ? [selectedEvent.location.coordinates[0], selectedEvent.location.coordinates[1]] : [0, 0]}
          zoom={selectedEvent ? 3 : 1}
          minZoom={1}
          maxZoom={5}
          filterZoomEvent={() => false} // 강제 고정
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  // 더 부드럽고 단순한 색감 적용
                  fill={dark ? "#0f172a" : "#f1f5f9"}
                  stroke={dark ? "#1e293b" : "#e2e8f0"}
                  strokeWidth={0.3} // 경계선을 더 얇게 하여 단순함 강조
                  style={{
                    default: { outline: "none" },
                    hover: { fill: dark ? "#1e293b" : "#cbd5e1", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {events.map((event, idx) => {
            const isSelected = selectedEvent && selectedEvent._id === event._id;
            return (
              <Marker 
                key={event._id || idx} 
                coordinates={event.location.coordinates}
                onClick={() => onMarkerClick(event)}
              >
                {/* 마커 또한 더 작고 세련되게 조정 */}
                <circle
                  r={isSelected ? 5 : 2.5}
                  fill={isSelected ? "#3b82f6" : "#94a3b8"}
                  fillOpacity={isSelected ? 1 : 0.6}
                  stroke="#fff"
                  strokeWidth={isSelected ? 2 : 1}
                  className="cursor-pointer transition-all duration-500 hover:scale-150"
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default HistoryMap;
