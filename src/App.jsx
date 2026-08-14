import React, { useEffect, useRef } from 'react';
import { Map, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function App() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    const osmStyle = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };

    mapInstance.current = new Map({
      container: mapContainer.current,
      style: osmStyle, 
      center: [15.0, 50.0], 
      zoom: 4
    });


    new Marker({ color: '#b91c1c' })
      .setLngLat([4.4065, 50.6794])
      .setPopup(
        new Popup({ offset: 25 }).setHTML(
          '<h3 style="margin:0 0 4px 0;">Waterloo (1815)</h3><p style="margin:0;">Napóleon végső veresége.</p>'
        )
      )
      .addTo(mapInstance.current);

  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <h1 
        style={{ 
          position: 'absolute', 
          top: 12, 
          left: 12, 
          zIndex: 10, 
          background: '#ffffff', 
          padding: '8px 16px', 
          borderRadius: '8px', 
          fontFamily: 'sans-serif',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          margin: 0
        }}
      >
        Battles of Territories (Demo)
      </h1>
      <div 
        ref={mapContainer} 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
      />
    </div>
  );
}