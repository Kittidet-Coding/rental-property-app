import { useRef, useEffect, useState } from 'react';
import { MapView } from './Map';
import { Loader2 } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  price: number;
  address: string;
  latitude: number | string | null | undefined;
  longitude: number | string | null | undefined;
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

// Helper function to safely convert coordinate to number
function toNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isFinite(num) ? num : null;
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
    if (searchCoordinates && isFinite(searchCoordinates.lat) && isFinite(searchCoordinates.lng)) {
      return searchCoordinates;
    }

    // Filter out properties with invalid coordinates
    const validProperties = properties.filter((p) => {
      const lat = toNumber(p.latitude);
      const lng = toNumber(p.longitude);
      return lat !== null && lng !== null;
    });

    if (validProperties.length === 0) {
      return { lat: 47.4979, lng: 19.0402 }; // Budapest center
    }

    let sumLat = 0;
    let sumLng = 0;
    let count = 0;

    validProperties.forEach((p) => {
      const lat = toNumber(p.latitude);
      const lng = toNumber(p.longitude);
      if (lat !== null && lng !== null) {
        sumLat += lat;
        sumLng += lng;
        count++;
      }
    });

    return {
      lat: count > 0 ? sumLat / count : 47.4979,
      lng: count > 0 ? sumLng / count : 19.0402,
    };
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    setIsLoading(false);
    addPropertyMarkers(map);
  };

  const addPropertyMarkers = (map: google.maps.Map) => {
    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current = [];

      // Filter out properties with invalid coordinates
      const validProperties = properties.filter((p) => {
        const lat = toNumber(p.latitude);
        const lng = toNumber(p.longitude);
        return lat !== null && lng !== null;
      });

      // Add markers for each valid property
      validProperties.forEach((property) => {
        try {
          const lat = toNumber(property.latitude);
          const lng = toNumber(property.longitude);

          if (lat === null || lng === null) {
            console.warn('Skipping property with null coordinates:', property.id);
            return;
          }

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat, lng },
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
        } catch (e) {
          console.error('Error creating marker for property:', property.id, e);
        }
      });

      // Fit bounds to show all markers
      if (validProperties.length > 0) {
        try {
          const bounds = new google.maps.LatLngBounds();
          validProperties.forEach((property) => {
            const lat = toNumber(property.latitude);
            const lng = toNumber(property.longitude);
            if (lat !== null && lng !== null) {
              bounds.extend({ lat, lng });
            }
          });
          map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
        } catch (e) {
          console.warn('Error fitting bounds:', e);
        }
      }
    } catch (e) {
      console.error('Error adding property markers:', e);
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
