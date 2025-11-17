import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Bed, Bath, Maximize2, ChevronLeft, ChevronRight, Phone, Mail } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PropertyDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/property/:id");
  const { isAuthenticated } = useAuth();
  const propertyId = params?.id ? parseInt(params.id) : null;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch property details
  const { data: property, isLoading, error } = trpc.properties.getById.useQuery(propertyId || 0, {
    enabled: propertyId !== null,
  });

  // Check if property is favorited
  const { data: favoriteStatus } = trpc.favorites.isFavorite.useQuery(propertyId || 0, {
    enabled: isAuthenticated && propertyId !== null,
  });

  const toggleFavoriteMutation = trpc.favorites.toggle.useMutation({
    onSuccess: (result) => {
      setIsFavorited(result.isFavorite);
    },
  });

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      alert("Please log in to save favorites");
      return;
    }
    if (propertyId) {
      toggleFavoriteMutation.mutate(propertyId);
    }
  };

  const handlePrevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
    }
  };

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-border">
          <div className="container py-4">
            <Button variant="outline" onClick={() => setLocation("/listings")}>
              ← Back to Listings
            </Button>
          </div>
        </header>
        <div className="container py-12 text-center">
          <p className="text-lg text-foreground/70 mb-4">Property not found</p>
          <Button onClick={() => setLocation("/listings")}>Back to Listings</Button>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const currentImage = images.length > 0 ? images[currentImageIndex] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8" />
            <span className="text-xl font-bold text-foreground">{APP_TITLE}</span>
          </div>
          <Button variant="outline" onClick={() => setLocation("/listings")}>
            ← Back to Listings
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative bg-gray-200 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
                {currentImage ? (
                  <img
                    src={currentImage.imageUrl}
                    alt={`${property.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-gray-500">No Image Available</span>
                  </div>
                )}

                {/* Image Counter */}
                {images.length > 0 && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition"
                    >
                      <ChevronLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition"
                    >
                      <ChevronRight className="w-6 h-6 text-foreground" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        index === currentImageIndex ? "border-primary" : "border-border"
                      }`}
                    >
                      <img src={image.imageUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">{property.title}</h1>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-border">
                  <p className="text-4xl font-bold text-primary">
                    {property.currency} {property.price.toLocaleString()}
                  </p>
                  <p className="text-foreground/70">/month</p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Bed className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{property.beds}</span>
                    </div>
                    <p className="text-sm text-foreground/70">Bedrooms</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Bath className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{property.baths}</span>
                    </div>
                    <p className="text-sm text-foreground/70">Bathrooms</p>
                  </div>
                  {property.sqm && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Maximize2 className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold text-foreground">{property.sqm}</span>
                      </div>
                      <p className="text-sm text-foreground/70">Square Meters</p>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="mb-8 pb-8 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{property.address}</p>
                      <p className="text-foreground/70">
                        {property.city}, {property.country}
                      </p>
                      {property.zipCode && <p className="text-foreground/70">{property.zipCode}</p>}
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-8 pb-8 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-3">
                    {property.petFriendly && (
                      <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                        🐾 Pet Friendly
                      </span>
                    )}
                    {property.parking && (
                      <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        🚗 Parking Available
                      </span>
                    )}
                    <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                      {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {property.description && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Description</h2>
                    <p className="text-foreground/70 leading-relaxed whitespace-pre-wrap">{property.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <Card className="mb-6 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Contact Landlord</h2>

                <div className="space-y-4 mb-6">
                  <Button className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Message
                  </Button>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground mb-4">Property Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-foreground/70">Type</p>
                      <p className="font-medium text-foreground capitalize">{property.type}</p>
                    </div>
                    <div>
                      <p className="text-foreground/70">Posted</p>
                      <p className="font-medium text-foreground">
                        {new Date(property.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Favorite Button */}
            <Button
              variant={isFavorited ? "default" : "outline"}
              className="w-full flex items-center justify-center gap-2"
              onClick={handleToggleFavorite}
              disabled={toggleFavoriteMutation.isPending}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              {isFavorited ? "Saved" : "Save Property"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
