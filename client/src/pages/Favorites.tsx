import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Heart, MapPin, Bed, Bath, Trash2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);

  // Fetch user's favorite properties
  const { data: favorites, isLoading, refetch } = trpc.favorites.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Remove from favorites mutation
  const removeFromFavoritesMutation = trpc.favorites.toggle.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Handle loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-foreground/60">Loading your favorites...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/listings")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>

          <div className="flex items-center justify-center h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Sign in to view favorites</h2>
                  <p className="text-foreground/60 mb-6">
                    Please log in to save and manage your favorite properties.
                  </p>
                  <Button
                    onClick={() => setLocation("/add-property")}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty favorites
  if (!favorites || favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/listings")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>

          <div className="flex items-center justify-center h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
                  <p className="text-foreground/60 mb-6">
                    Start adding properties to your favorites to compare and track them.
                  </p>
                  <Button
                    onClick={() => setLocation("/listings")}
                    className="w-full"
                  >
                    Browse Properties
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Calculate price range for comparison
  const prices = favorites.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  const handleRemoveFavorite = (propertyId: number) => {
    removeFromFavoritesMutation.mutate({ propertyId });
  };

  const handleSelectForComparison = (propertyId: number) => {
    setSelectedProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/listings")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                My Favorites
              </h1>
              <p className="text-foreground/60">
                {favorites.length} propert{favorites.length !== 1 ? "ies" : "y"} saved
              </p>
            </div>

            {selectedProperties.length > 0 && (
              <Button
                variant="default"
                onClick={() => setSelectedProperties([])}
              >
                Clear Selection ({selectedProperties.length})
              </Button>
            )}
          </div>
        </div>

        {/* Comparison Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-foreground/60 mb-1">Lowest Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  {minPrice.toLocaleString()} HUF
                </p>
                <p className="text-xs text-foreground/40 mt-1">/month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-foreground/60 mb-1">Average Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  {avgPrice.toLocaleString()} HUF
                </p>
                <p className="text-xs text-foreground/40 mt-1">/month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-foreground/60 mb-1">Highest Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  {maxPrice.toLocaleString()} HUF
                </p>
                <p className="text-xs text-foreground/40 mt-1">/month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <Card
              key={property.id}
              className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                selectedProperties.includes(property.id)
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
              onClick={() => handleSelectForComparison(property.id)}
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0].imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}

                {/* Favorite Badge */}
                <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 shadow-md">
                  <Heart className="w-5 h-5 fill-current" />
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-lg font-semibold">
                  {property.price.toLocaleString()} HUF/mo
                </div>
              </div>

              <CardContent className="pt-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {property.title}
                </h3>

                {/* Location */}
                <div className="flex items-center text-foreground/60 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {property.city}, {property.country}
                  </span>
                </div>

                {/* Property Details */}
                <div className="flex gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-foreground/60" />
                    <span>{property.beds} bed{property.beds !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4 text-foreground/60" />
                    <span>{property.baths} bath{property.baths !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="text-foreground/60">
                    {property.sqm} m²
                  </div>
                </div>

                {/* Type Badge */}
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {property.type}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/property/${property.id}`);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(property.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison View */}
        {selectedProperties.length > 1 && (
          <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">
              Comparison ({selectedProperties.length} properties)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Property</th>
                    <th className="text-center py-3 px-4 font-semibold">Price</th>
                    <th className="text-center py-3 px-4 font-semibold">Beds</th>
                    <th className="text-center py-3 px-4 font-semibold">Baths</th>
                    <th className="text-center py-3 px-4 font-semibold">Size</th>
                    <th className="text-center py-3 px-4 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {favorites
                    .filter((p) => selectedProperties.includes(p.id))
                    .map((property) => (
                      <tr key={property.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <button
                            onClick={() =>
                              setLocation(`/property/${property.id}`)
                            }
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {property.title}
                          </button>
                        </td>
                        <td className="text-center py-3 px-4 font-semibold">
                          {property.price.toLocaleString()} HUF
                        </td>
                        <td className="text-center py-3 px-4">
                          {property.beds}
                        </td>
                        <td className="text-center py-3 px-4">
                          {property.baths}
                        </td>
                        <td className="text-center py-3 px-4">
                          {property.sqm} m²
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {property.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
