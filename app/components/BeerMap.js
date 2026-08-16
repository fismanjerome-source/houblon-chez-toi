'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
const { BREWERY_LOCATIONS, HQ_LOCATION } = require('../../lib/breweryLocations');
const { DELIVERY_TOWN_LOCATIONS } = require('../../lib/deliveryTowns');
const { BEER_COLORS } = require('./beerColors');

function flagSvg(country) {
  const stripes =
    country === 'BE'
      ? ['#000000', '#FDDA24', '#EF3340']
      : ['#0055A4', '#FFFFFF', '#EF4135'];
  return `
    <div style="width:26px;height:26px;border-radius:50%;background:#fff;border:2px solid #1B2E20;box-shadow:0 2px 6px rgba(15,23,18,0.35);display:flex;align-items:center;justify-content:center;overflow:hidden;">
      <svg width="16" height="12" viewBox="0 0 30 24">
        <rect width="10" height="24" x="0" fill="${stripes[0]}" />
        <rect width="10" height="24" x="10" fill="${stripes[1]}" />
        <rect width="10" height="24" x="20" fill="${stripes[2]}" />
      </svg>
    </div>
  `;
}

function homeSvg() {
  return `
    <div style="width:38px;height:38px;border-radius:50%;background:#1B2E20;border:3px solid #C98A2E;box-shadow:0 3px 10px rgba(15,23,18,0.5);display:flex;align-items:center;justify-content:center;font-size:18px;">
      🏠
    </div>
  `;
}

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

export default function BeerMap({ beers }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const insetMapRef = useRef(null);
  const insetRef = useRef(null);

  useEffect(() => {
    let map;
    let insetMap;
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      map = L.map(containerRef.current, { scrollWheelZoom: false, attributionControl: false });
      mapRef.current = map;

      L.control.attribution({ prefix: false }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 12,
      }).addTo(map);

      const bounds = [[HQ_LOCATION.lat, HQ_LOCATION.lng]];

      // Périmètre de livraison, délimité par les communes réellement desservies.
      const deliveryHull = convexHull(
        DELIVERY_TOWN_LOCATIONS.map((t) => [t.lat, t.lng]).concat([[HQ_LOCATION.lat, HQ_LOCATION.lng]])
      );
      const deliveryZone = L.polygon(deliveryHull, {
        color: '#B36F1E',
        weight: 3,
        fillColor: '#C98A2E',
        fillOpacity: 0.3,
      }).addTo(map);
      deliveryZone.bindTooltip('Zone de livraison', {
        permanent: true,
        direction: 'center',
        className: 'delivery-zone-label',
      });

      const hqMarker = L.marker([HQ_LOCATION.lat, HQ_LOCATION.lng], {
        icon: L.divIcon({ html: homeSvg(), className: '', iconSize: [38, 38], iconAnchor: [19, 19] }),
        zIndexOffset: 1000,
      }).addTo(map);
      hqMarker.bindPopup(
        `<div style="font-family:'Public Sans',sans-serif;font-size:13px;min-width:170px;">
          <div style="font-family:'Fraunces',serif;font-size:14.5px;color:#1B2E20;margin-bottom:2px;">🏠 Bondues — notre siège</div>
          <div style="font-size:12.5px;color:#7A3B24;margin-bottom:4px;">Zone de livraison entourée en ambre</div>
          <div style="font-size:12px;color:#0F1712;opacity:0.75;">${HQ_LOCATION.address}</div>
        </div>`
      );

      BREWERY_LOCATIONS.forEach((loc) => {
        bounds.push([loc.lat, loc.lng]);
        const locBeers = loc.beerNames
          .map((name) => beers.find((b) => b.name === name))
          .filter(Boolean);
        if (locBeers.length === 0) return;

        const marker = L.marker([loc.lat, loc.lng], {
          icon: L.divIcon({ html: flagSvg(loc.country), className: '', iconSize: [26, 26], iconAnchor: [13, 13] }),
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

      map.fitBounds(bounds, { padding: [30, 30] });

      // Mini-carte détail, toujours zoomée sur la zone de livraison — visible
      // sans avoir à zoomer la grande carte qui montre aussi les brasseries lointaines.
      if (!cancelled && insetRef.current && !insetMapRef.current) {
        insetMap = L.map(insetRef.current, {
          attributionControl: false,
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          touchZoom: false,
          tap: false,
        });
        insetMapRef.current = insetMap;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 13 }).addTo(insetMap);

        L.polygon(deliveryHull, {
          color: '#B36F1E',
          weight: 3,
          fillColor: '#C98A2E',
          fillOpacity: 0.32,
        }).addTo(insetMap);

        L.marker([HQ_LOCATION.lat, HQ_LOCATION.lng], {
          icon: L.divIcon({ html: homeSvg(), className: '', iconSize: [30, 30], iconAnchor: [15, 15] }),
        }).addTo(insetMap);

        insetMap.fitBounds(deliveryHull, { padding: [14, 14] });
      }
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (insetMapRef.current) {
        insetMapRef.current.remove();
        insetMapRef.current = null;
      }
    };
  }, [beers]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} style={{ height: 420, borderRadius: 6, border: '1px solid var(--line)' }} />
      <div
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 400,
          width: 168, background: 'var(--surface)', borderRadius: 6,
          border: '2px solid var(--pine-fixed, #1B2E20)', boxShadow: '0 4px 14px rgba(15,23,18,0.35)',
          overflow: 'hidden', pointerEvents: 'none',
        }}
      >
        <div ref={insetRef} style={{ height: 130 }} />
        <div
          style={{
            fontFamily: 'Space Mono, monospace', fontSize: 10.5, fontWeight: 500,
            color: '#fff', background: '#B36F1E', textAlign: 'center', padding: '4px 6px',
          }}
        >
          🏠 Zone de livraison
        </div>
      </div>
    </div>
  );
}
