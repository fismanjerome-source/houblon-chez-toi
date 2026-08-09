'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
const { BREWERY_LOCATIONS } = require('../../lib/breweryLocations');
const { BEER_COLORS } = require('./beerColors');

export default function BeerMap({ beers }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let map;
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      map = L.map(containerRef.current, { scrollWheelZoom: false });
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 12,
      }).addTo(map);

      const bounds = [];

      BREWERY_LOCATIONS.forEach((loc) => {
        bounds.push([loc.lat, loc.lng]);
        const locBeers = loc.beerNames
          .map((name) => beers.find((b) => b.name === name))
          .filter(Boolean);
        if (locBeers.length === 0) return;

        const marker = L.circleMarker([loc.lat, loc.lng], {
          radius: 9,
          weight: 2,
          color: '#1B2E20',
          fillColor: '#C98A2E',
          fillOpacity: 0.9,
        }).addTo(map);

        const popupHtml = `
          <div style="font-family:'Public Sans',sans-serif;font-size:13px;min-width:160px;">
            <div style="font-family:'Space Mono',monospace;font-size:10.5px;color:#7A3B24;margin-bottom:6px;">${loc.town}</div>
            ${locBeers
              .map(
                (b) =>
                  `<a href="#beer-${b.id}" style="display:flex;align-items:center;gap:6px;padding:3px 0;color:#0F1712;text-decoration:none;">
                    <span style="width:9px;height:9px;border-radius:50%;background:${BEER_COLORS[b.name] || '#999'};flex-shrink:0;"></span>
                    ${b.name}
                  </a>`
              )
              .join('')}
          </div>
        `;
        marker.bindPopup(popupHtml);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [30, 30] });
      } else {
        map.setView([50.6, 3.3], 8);
      }
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [beers]);

  return <div ref={containerRef} style={{ height: 360, borderRadius: 6, border: '1px solid var(--line)' }} />;
}
