'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
const { DELIVERY_TOWN_LOCATIONS } = require('../../lib/deliveryTowns');
const { HQ_LOCATION } = require('../../lib/breweryLocations');

// Enveloppe convexe (Andrew's monotone chain) pour délimiter le périmètre de livraison
// à partir des communes desservies, sans dépendre d'un rayon arbitraire.
function convexHull(points) {
  const pts = [...points].sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
  if (pts.length < 3) return pts;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

function homeSvg() {
  return `
    <div style="width:40px;height:40px;border-radius:50%;background:#1B2E20;border:3px solid #C98A2E;box-shadow:0 3px 10px rgba(15,23,18,0.5);display:flex;align-items:center;justify-content:center;font-size:19px;">
      🏠
    </div>
  `;
}

function townSvg() {
  return `
    <div style="width:16px;height:16px;border-radius:50%;background:#C98A2E;border:2px solid #F3ECD8;box-shadow:0 1px 4px rgba(15,23,18,0.4);"></div>
  `;
}

export default function DeliveryZoneMap() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let map;
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      map = L.map(containerRef.current, { scrollWheelZoom: false, attributionControl: false });
      mapRef.current = map;

      L.control.attribution({ prefix: false }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 14,
      }).addTo(map);

      const allPoints = [
        [HQ_LOCATION.lat, HQ_LOCATION.lng],
        ...DELIVERY_TOWN_LOCATIONS.map((t) => [t.lat, t.lng]),
      ];
      const hull = convexHull(allPoints);

      L.polygon(hull, {
        color: '#C98A2E',
        weight: 2.5,
        fillColor: '#C98A2E',
        fillOpacity: 0.14,
      }).addTo(map);

      const hqMarker = L.marker([HQ_LOCATION.lat, HQ_LOCATION.lng], {
        icon: L.divIcon({ html: homeSvg(), className: '', iconSize: [40, 40], iconAnchor: [20, 20] }),
        zIndexOffset: 1000,
      }).addTo(map);
      hqMarker.bindPopup(
        `<div style="font-family:'Public Sans',sans-serif;font-size:13px;min-width:170px;">
          <div style="font-family:'Fraunces',serif;font-size:14.5px;color:#1B2E20;margin-bottom:2px;">🏠 Bondues — notre siège</div>
          <div style="font-size:12px;color:#0F1712;opacity:0.75;">${HQ_LOCATION.address}</div>
        </div>`
      );

      DELIVERY_TOWN_LOCATIONS.forEach((t) => {
        const marker = L.marker([t.lat, t.lng], {
          icon: L.divIcon({ html: townSvg(), className: '', iconSize: [16, 16], iconAnchor: [8, 8] }),
        }).addTo(map);
        marker.bindTooltip(t.name, { direction: 'top', offset: [0, -6] });
      });

      map.fitBounds(hull, { padding: [24, 24] });
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ height: 340, borderRadius: 6, border: '1px solid var(--line)' }} />;
}
