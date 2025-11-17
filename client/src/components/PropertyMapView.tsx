import { useEffect, useRef, useState } from 'react';
import { MapView } from './Map';
import { Loader2 } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  price: number;
  currency?: string;
  address: string;
  latitude: number | string | null | undefined;
  longitude: number | string | null | undefined;
  distance?: number;
  beds?: number;
  baths?: number;
  sqm?: number;
  images?: Array<{ imageUrl: string }>;
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
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
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
      console.log('addPropertyMarkers called with', properties.length, 'properties');
      // Clear existing markers
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = [];

      // Close existing info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      // Filter out properties with invalid coordinates
      const validProperties = properties.filter((p) => {
        const lat = toNumber(p.latitude);
        const lng = toNumber(p.longitude);
        const isValid = lat !== null && lng !== null;
        if (!isValid) {
          console.log('Skipping property', p.id, 'with lat:', p.latitude, 'lng:', p.longitude);
        }
        return isValid;
      });
      console.log('Valid properties for markers:', validProperties.length);

      // Add markers for each valid property
      validProperties.forEach((property) => {
        try {
          const lat = toNumber(property.latitude);
          const lng = toNumber(property.longitude);

          if (lat === null || lng === null) {
            console.warn('Skipping property with null coordinates:', property.id);
            return;
          }

          // Create a standard marker
          const marker = new google.maps.Marker({
            map,
            position: { lat, lng },
            title: property.title,
          });

          // Create info window content
          const infoContent = document.createElement('div');
          infoContent.className = 'p-0 max-w-xs rounded-lg overflow-hidden';
          
          const imageUrl = property.images && property.images.length > 0 ? property.images[0].imageUrl : null;
          const currency = property.currency || '$';
          
          infoContent.innerHTML = `
            <div class="bg-white rounded-lg overflow-hidden shadow-lg">
              ${imageUrl ? `<img src="${imageUrl}" alt="${property.title}" class="w-full h-32 object-cover" />` : '<div class="w-full h-32 bg-gray-300 flex items-center justify-center text-gray-500">No Image</div>'}
              <div class="p-3">
                <div class="font-semibold text-sm text-gray-800">${property.title}</div>
                <div class="text-blue-600 font-bold text-base mt-1">${currency} ${property.price.toLocaleString()}/month</div>
                <div class="text-gray-600 text-xs mt-2">${property.address}</div>
                ${property.distance ? `<div class="text-gray-500 text-xs mt-1">📍 ${property.distance.toFixed(1)} km away</div>` : ''}
                ${property.beds ? `<div class="text-gray-600 text-xs mt-2">🛏️ ${property.beds} beds • 🚿 ${property.baths} baths • 📐 ${property.sqm} m²</div>` : ''}
                <button class="mt-3 w-full bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700 transition">View Details</button>
              </div>
            </div>
          `;

          const infoWindow = new google.maps.InfoWindow({
            content: infoContent,
          });

          // Add click listener to marker
          marker.addListener('click', () => {
            // Close previous info window
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }

            infoWindow.open(map, marker);
            infoWindowRef.current = infoWindow;

            if (onPropertyClick) {
              onPropertyClick(property);
            }
          });

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

  // Update markers when properties change
  useEffect(() => {
    if (mapRef.current) {
      addPropertyMarkers(mapRef.current);
    }
  }, [properties]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}
      <MapView
        onMapReady={handleMapReady}
        initialCenter={getMapCenter()}
        initialZoom={searchCoordinates ? 13 : 4}
      />
    </div>
  );
}
