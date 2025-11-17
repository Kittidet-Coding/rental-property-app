import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Bed, Bath, Maximize2, ChevronLeft, ChevronRight, Map, List } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { calculateDistance, formatDistance, geocodeAddress } from "@/lib/distance";


export default function Listings() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const queryParams = new URLSearchParams(window.location.search);
  const initialCity = queryParams.get("city") || "";

  const [filters, setFilters] = useState({
    city: initialCity,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    beds: undefined as number | undefined,
    baths: undefined as number | undefined,
    type: undefined as string | undefined,
    limit: 20,
    offset: 0,
  });

  const [searchInput, setSearchInput] = useState(initialCity);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [searchCoordinates, setSearchCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [propertiesWithDistance, setPropertiesWithDistance] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'distance' | 'price-low' | 'price-high' | 'newest'>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Fetch properties
  const { data: properties = [], isLoading } = trpc.properties.search.useQuery(filters);

  // Fetch user's favorite properties
  const { data: userFavorites = [] } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Update favorites set when user favorites load
  useEffect(() => {
    if (userFavorites.length > 0) {
      setFavorites(new Set(userFavorites.map((fav) => fav.id)));
    }
  }, [userFavorites]);

  // Calculate distances when properties or search coordinates change
  useEffect(() => {
    if (properties.length > 0 && searchCoordinates && hasSearched) {
      const withDistance = properties.map((property: any) => {
        if (property.latitude && property.longitude) {
          const distance = calculateDistance(
            parseFloat(property.latitude),
            parseFloat(property.longitude),
            searchCoordinates.lat,
            searchCoordinates.lng
          );
          return { ...property, distance };
        }
        return property;
      });
      // Filter by distance if maxDistance is set
      let filtered = withDistance;
      if (maxDistance !== undefined) {
        filtered = withDistance.filter((p: any) => p.distance === undefined || p.distance <= maxDistance);
      }
      // Sort by selected option
      filtered.sort((a: any, b: any) => {
        switch (sortBy) {
          case 'distance':
            return (a.distance || Infinity) - (b.distance || Infinity);
          case 'price-low':
            return (a.price || Infinity) - (b.price || Infinity);
          case 'price-high':
            return (b.price || Infinity) - (a.price || Infinity);
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          default:
            return 0;
        }
      });
      setPropertiesWithDistance(filtered);
    } else if (properties.length > 0) {
      let sorted = [...properties];
      sorted.sort((a: any, b: any) => {
        switch (sortBy) {
          case 'price-low':
            return (a.price || Infinity) - (b.price || Infinity);
          case 'price-high':
            return (b.price || Infinity) - (a.price || Infinity);
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          default:
            return 0;
        }
      });
      setPropertiesWithDistance(sorted);
    }
  }, [properties, searchCoordinates, hasSearched, maxDistance, sortBy]);



  const toggleFavoriteMutation = trpc.favorites.toggle.useMutation({
    onSuccess: (result, variables) => {
      setFavorites((prev) => {
        const newSet = new Set(prev);
        if (result.isFavorite) {
          newSet.add(variables.propertyId);
        } else {
          newSet.delete(variables.propertyId);
        }
        return newSet;
      });
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      city: searchInput,
      offset: 0,
    }));
    setHasSearched(true);

    if (searchInput) {
      try {
        const coords = await geocodeAddress(searchInput);
        if (coords) {
          setSearchCoordinates(coords);
        }
      } catch (error) {
        console.error("Error geocoding:", error);
      }
    }
  };

  const handleToggleFavorite = (propertyId: number) => {
    if (!isAuthenticated) {
      alert("Please log in to save favorites");
      return;
    }
    toggleFavoriteMutation.mutate({ propertyId });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      city: "",
      minPrice: undefined,
      maxPrice: undefined,
      beds: undefined,
      baths: undefined,
      type: undefined,
      limit: 20,
      offset: 0,
    });
    setSearchInput("");
  };

  const activeFiltersCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.beds,
    filters.baths,
    filters.type,
  ].filter((f) => f !== undefined).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8" />
              <span className="text-xl font-bold text-foreground">{APP_TITLE}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setLocation("/add-property")}>
                + List Property
              </Button>
              <Button variant="outline" onClick={() => setLocation("/")}>
                ← Back to Home
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by city, address, or ZIP code"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Search
            </Button>
          </form>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 ${
            showFilters ? "block" : "hidden lg:block"
          }`}>
            <div className="bg-white rounded-lg border border-border p-4 lg:p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6">Filters</h2>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Price Range</label>
                  <div className="flex gap-2 text-sm">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ""}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value ? parseInt(e.target.value) : undefined)}
                    className="text-xs lg:text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ""}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value ? parseInt(e.target.value) : undefined)}
                    className="text-xs lg:text-sm"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Bedrooms</label>
                  <div className="flex gap-1 lg:gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      variant={filters.beds === num ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange("beds", filters.beds === num ? undefined : num)}
                      className="flex-1 text-xs lg:text-sm"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Bathrooms</label>
                  <div className="flex gap-1 lg:gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <Button
                      key={num}
                      variant={filters.baths === num ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange("baths", filters.baths === num ? undefined : num)}
                      className="flex-1 text-xs lg:text-sm"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Distance Range */}
              {hasSearched && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">Distance Range</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={maxDistance || 100}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-foreground/70">
                      {maxDistance ? `Up to ${maxDistance} km` : "No limit"}
                    </div>
                  </div>
                </div>
              )}

              {/* Property Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <select
                  value={filters.type || ""}
                  onChange={(e) => handleFilterChange("type", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                >
                  <option value="">All Types</option>
                  <option value="room">Room</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(activeFiltersCount > 0 || maxDistance !== undefined) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleClearFilters();
                    setMaxDistance(undefined);
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header with Filter Toggle */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {filters.city ? `Rentals in ${filters.city}` : "All Rentals"}
                </h1>
                <p className="text-foreground/70">
                  {isLoading ? "Loading..." : `${properties.length} listings found`}
                </p>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-2 border border-border rounded-lg text-foreground hover:bg-gray-50 transition"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
            
            {/* Sort and View Toggle */}
            <div className="flex gap-2 items-center flex-wrap mb-6">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-md text-sm bg-white text-foreground"
              >
                <option value="distance">Sort: Distance (Nearest)</option>
                <option value="price-low">Sort: Price (Low to High)</option>
                <option value="price-high">Sort: Price (High to Low)</option>
                <option value="newest">Sort: Newest First</option>
              </select>
              
              <div className="flex gap-1 border border-border rounded-md p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded transition flex items-center gap-1 text-sm ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-transparent text-foreground hover:bg-gray-100'}`}
                >
                  <List size={16} />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded transition flex items-center gap-1 text-sm ${viewMode === 'map' ? 'bg-primary text-white' : 'bg-transparent text-foreground hover:bg-gray-100'}`}
                >
                  <Map size={16} />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>

            {/* Original Header (hidden on mobile with filter toggle) */}
            {!showFilters && (
              <div className="mb-6 lg:hidden">
              </div>
            )}

            {/* Property Grid */}
            {showFilters && (
              <div className="mb-6 lg:hidden">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  View Results
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-foreground/70">Loading properties...</p>
                </div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-foreground/70">No properties found matching your criteria.</p>
                <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : viewMode === 'map' ? (
              <div className="bg-gray-100 rounded-lg overflow-hidden h-96 lg:h-screen flex items-center justify-center">
                <div className="text-center">
                  <Map size={48} className="mx-auto mb-4 text-primary" />
                  <p className="text-foreground/70 mb-2">Map View Coming Soon</p>
                  <p className="text-sm text-foreground/50">Interactive Google Map with property markers and distance visualization</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
                {propertiesWithDistance.map((property: any) => (
                  <Card
                    key={property.id}
                    className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                    onClick={() => setLocation(`/property/${property.id}`)}
                  >
                    {/* Image Container */}
                    <div className="relative bg-gray-200 h-40 sm:h-48 overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0].imageUrl}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}

                      {/* Image Count Badge */}
                      {property.images && property.images.length > 0 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                          {property.images.length} photos
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(property.id);
                        }}
                        className="absolute top-2 left-2 bg-white rounded-full p-2 hover:bg-gray-100 transition"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.has(property.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <CardContent className="p-3 lg:p-4">
                      {/* Price */}
                      <div className="mb-2 lg:mb-3">
                        <p className="text-xl lg:text-2xl font-bold text-primary">
                          {property.currency} {property.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-foreground/60">/month</p>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm lg:text-base">{property.title}</h3>

                      {/* Details */}
                      <div className="flex gap-2 lg:gap-4 mb-2 lg:mb-3 text-xs lg:text-sm text-foreground/70">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.beds}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.baths}</span>
                        </div>
                        {property.sqm && (
                          <div className="flex items-center gap-1">
                            <Maximize2 className="w-4 h-4" />
                            <span>{property.sqm} m²</span>
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2 text-xs lg:text-sm text-foreground/70 mb-3 lg:mb-4">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="line-clamp-2">{property.address}</span>
                          {property.distance !== undefined && hasSearched && (
                            <div className="text-xs text-primary font-semibold mt-1">
                              {formatDistance(Math.round(property.distance))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex gap-2 mb-3 lg:mb-4 flex-wrap">
                        {property.petFriendly && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded whitespace-nowrap">Pet Friendly</span>
                        )}
                        {property.parking && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded whitespace-nowrap">Parking</span>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-sm lg:text-base"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/property/${property.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {properties.length > 0 && (
              <div className="flex items-center justify-center gap-2 lg:gap-4 mt-6 lg:mt-8 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.offset === 0}
                  onClick={() => handleFilterChange("offset", Math.max(0, filters.offset - filters.limit))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Previous</span>
                </Button>

                <span className="text-foreground/70 text-sm">
                  Page {Math.floor(filters.offset / filters.limit) + 1}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange("offset", filters.offset + filters.limit)}
                >
                  <span className="hidden sm:inline mr-2">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
