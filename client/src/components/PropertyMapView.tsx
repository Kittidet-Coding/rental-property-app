import { useRef, useEffect, useState } from 'react';
import { MapView } from './Map';
import { Loader2 } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  price: number;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  beds?: number;
  baths?: number;
  sqm?: number;
}

interface PropertyMapViewProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  searchCoordinates?: { lat: number; lng: number };
}

export default function PropertyMapView({
  properties,
  onPropertyClick,
  searchCoordinates,
}: PropertyMapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate center of map based on properties or search location
  const getMapCenter = () => {
    if (searchCoordinates) {
      return searchCoordinates;
    }

    if (properties.length === 0) {
      return { lat: 47.4979, lng: 19.0402 }; // Budapest center
    }

    const avgLat =
      properties.reduce((sum, p) => sum + p.latitude, 0) / properties.length;
    const avgLng =
      properties.reduce((sum, p) => sum + p.longitude, 0) / properties.length;

    return { lat: avgLat, lng: avgLng };
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsLoading(false);
    addPropertyMarkers(map);
  };

  const addPropertyMarkers = (map: google.maps.Map) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Add markers for each property
    properties.forEach((property) => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: property.latitude, lng: property.longitude },
        title: property.title,
      });

      // Create info window content
      const infoContent = document.createElement('div');
      infoContent.className = 'p-3 max-w-xs';
      infoContent.innerHTML = `
        <div class="font-semibold text-sm">${property.title}</div>
        <div class="text-blue-600 font-bold text-lg">$${property.price.toLocaleString()}/month</div>
        <div class="text-gray-600 text-xs mt-1">${property.address}</div>
        ${property.distance ? `<div class="text-gray-500 text-xs mt-1">${property.distance.toFixed(1)} km away</div>` : ''}
        ${property.beds ? `<div class="text-gray-600 text-xs mt-1">${property.beds} beds • ${property.baths} baths • ${property.sqm} m²</div>` : ''}
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      // Add click listeners
      marker.addEventListener('click', () => {
        // Close all other info windows
        markersRef.current.forEach((m) => {
          if ((m as any).infoWindow) {
            (m as any).infoWindow.close();
          }
        });

        infoWindow.open(map, marker);
        (marker as any).infoWindow = infoWindow;

        if (onPropertyClick) {
          onPropertyClick(property);
        }
      });

      (marker as any).infoWindow = infoWindow;
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (properties.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      properties.forEach((property) => {
        bounds.extend({ lat: property.latitude, lng: property.longitude });
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      addPropertyMarkers(mapRef.current);
    }
  }, [properties, onPropertyClick]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      <MapView
        initialCenter={getMapCenter()}
        initialZoom={properties.length === 1 ? 15 : 12}
        onMapReady={handleMapReady}
      />
    </div>
  );
}
