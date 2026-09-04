import React, { useEffect, useRef, useState } from 'react';
import { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function App() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [years, setYears] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    mapInstance.current = new Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/01a067cc-2946-765e-a21c-6f0caca4fda3/style.json?key=dHD0ihaSbT4ciX19CoVW',
      center: [15.0, 50.0], 
      zoom: 4,
      minZoom: 3.5, 
      maxBounds: [ [-30.0, 30.0], [50.0, 72.0] ]
    });

    mapInstance.current.on('load', async () => {
      mapInstance.current.addSource('countries', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        promoteId: 'name' 
      });

      mapInstance.current.addLayer({
        id: 'countries-layer',
        type: 'fill',
        source: 'countries',
        filter: ['==', 'type', 'border'], 
        paint: {
          'fill-color': '#d4b886', 
          'fill-opacity': 0.6,
          'fill-outline-color': '#2a1a10'
        }
      });

      mapInstance.current.addLayer({
        id: 'countries-labels',
        type: 'symbol',
        source: 'countries',
        filter: ['==', 'type', 'label'], 
        layout: {
          'text-field': ['get', 'name'], 
          'text-size': 14,
          'text-anchor': 'center',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': false 
        },
        paint: {
          'text-color': '#2a1a10',
          'text-halo-color': 'rgba(255, 255, 255, 0.8)',
          'text-halo-width': 2
        }
      });

      try {
        const res = await fetch('http://localhost:3001/api/years');
        const availableYears = await res.json();
        if (availableYears.length > 0) {
          setYears(availableYears);
          
          const defaultIndex = availableYears.indexOf(1914) !== -1 ? availableYears.indexOf(1914) : 0;
          setCurrentIndex(defaultIndex);
          fetchBorders(availableYears[defaultIndex]);
        }
      } catch (err) {
        console.error('Hiba az induláskor:', err);
      }
    });
  }, []);

  const fetchBorders = async (year) => {
    try {
      const response = await fetch(`http://localhost:3001/api/borders?year=${year}`);
      const data = await response.json();
      if (mapInstance.current && mapInstance.current.getSource('countries')) {
        mapInstance.current.getSource('countries').setData(data);
      }
    } catch (error) {
      console.error('Hiba a térkép letöltésekor:', error);
    }
  };

  const handleSliderChange = (e) => {
    setCurrentIndex(parseInt(e.target.value));
  };

  const handleSliderRelease = (e) => {
    const newIndex = parseInt(e.target.value);
    fetchBorders(years[newIndex]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <h1 style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, background: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontFamily: 'sans-serif', margin: 0 }}>
        Battles of Territories
      </h1>
      
      {years.length > 0 && (
        <div style={{ 
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', 
          zIndex: 10, background: '#ffffff', padding: '15px 30px', borderRadius: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '300px'
        }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            {years[currentIndex]}
          </span>
          <input 
            type="range" 
            min="0" 
            max={years.length - 1} 
            value={currentIndex} 
            onChange={handleSliderChange}
            onMouseUp={handleSliderRelease}
            onTouchEnd={handleSliderRelease}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
      )}

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}