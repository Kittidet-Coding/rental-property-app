import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Bed, Bath, Maximize2, ChevronLeft, ChevronRight, Phone, Mail, X, Navigation } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapView } from "@/components/Map";

export default function PropertyDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/property/:id");
  const { isAuthenticated } = useAuth();
  const propertyId = params?.id ? parseInt(params.id) : null;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageForm, setMessageForm] = useState({ name: "", email: "", phone: "", message: "" });

  // Fetch property details
  const { data: property, isLoading, error } = trpc.properties.getById.useQuery(propertyId || 0, {
    enabled: propertyId !== null,
  });

  // Check if property is favorited
  const { data: favoriteStatus } = trpc.favorites.isFavorite.useQuery(
    propertyId && isAuthenticated ? { propertyId } : null as any,
    {
      enabled: isAuthenticated && propertyId !== null,
    }
  );

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
      toggleFavoriteMutation.mutate({ propertyId });
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

  const handleCallNow = () => {
    const phoneNumber = property?.phone || "+36 1 234 5678";
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleSendMessage = () => {
    setShowMessageForm(true);
  };

  const createInquiryMutation = trpc.inquiries.create.useMutation({
    onSuccess: () => {
      alert("Thank you! Your inquiry has been sent to the landlord.");
      setMessageForm({ name: "", email: "", phone: "", message: "" });
      setShowMessageForm(false);
    },
    onError: (error) => {
      alert(`Error sending inquiry: ${error.message}`);
    },
  });

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (propertyId) {
      createInquiryMutation.mutate({
        propertyId,
        name: messageForm.name,
        email: messageForm.email,
        phone: messageForm.phone || undefined,
        message: messageForm.message,
      });
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMessageForm(prev => ({ ...prev, [name]: value }));
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
        <div className="container py-3 lg:py-4 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-6 h-6 lg:w-8 lg:h-8" />
            <span className="text-lg lg:text-xl font-bold text-foreground">{APP_TITLE}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocation("/listings")} className="text-xs lg:text-sm">
            ← Back to Listings
          </Button>
        </div>
      </header>

      <div className="container py-6 lg:py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-6 lg:mb-8">
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
                  <div className="absolute top-2 lg:top-4 right-2 lg:right-4 bg-black/70 text-white px-2 lg:px-3 py-1 rounded text-xs lg:text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 lg:p-2 transition"
                    >
                      <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-foreground" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 lg:p-2 transition"
                    >
                      <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-foreground" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-1 lg:gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition ${
                      index === currentImageIndex ? "border-primary" : "border-gray-300"
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Property Details */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 lg:mb-4">{property.title}</h2>

                {/* Price */}
                <div className="mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-border">
                  <p className="text-2xl lg:text-4xl font-bold text-primary">
                    {property.currency} {property.price.toLocaleString()}
                  </p>
                  <p className="text-xs lg:text-base text-foreground/70">/month</p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-6 lg:mb-8 pb-6 lg:pb-8 border-b border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                      <Bed className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                      <span className="text-lg lg:text-2xl font-bold text-foreground">{property.beds}</span>
                    </div>
                    <p className="text-xs lg:text-sm text-foreground/70">Bedrooms</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                      <Bath className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                      <span className="text-lg lg:text-2xl font-bold text-foreground">{property.baths}</span>
                    </div>
                    <p className="text-xs lg:text-sm text-foreground/70">Bathrooms</p>
                  </div>
                  {property.sqm && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                        <Maximize2 className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                        <span className="text-lg lg:text-2xl font-bold text-foreground">{property.sqm}</span>
                      </div>
                      <p className="text-xs lg:text-sm text-foreground/70">Square Meters</p>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="mb-6 lg:mb-8 pb-6 lg:pb-8 border-b border-border">
                  <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-3 lg:mb-4">Location</h3>
                  <div className="flex items-start gap-2 lg:gap-3 mb-4">
                    <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="text-xs lg:text-base">
                      <p className="font-medium text-foreground">{property.address}</p>
                      <p className="text-foreground/70">
                        {property.city}, {property.country}
                      </p>
                      {property.zipCode && <p className="text-foreground/70">{property.zipCode}</p>}
                    </div>
                  </div>
                  
                  {/* Directions Button */}
                  <Button
                    onClick={() => {
                      const encodedAddress = encodeURIComponent(`${property.address}, ${property.city}, ${property.country}`);
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
                    }}
                    className="mb-4 gap-2"
                    variant="outline"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </Button>
                  
                  {/* Property Map */}
                  {property.latitude && property.longitude && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-border h-80">
                      <MapView
                        initialCenter={{
                          lat: typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude,
                          lng: typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude,
                        }}
                        initialZoom={16}
                        onMapReady={() => {}}
                      />
                    </div>
                  )}
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
          {/* Contact Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 lg:top-24 border border-border">
              <CardContent className="p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-3 lg:mb-4">Contact Landlord</h3>
                <div className="space-y-2 lg:space-y-3">
                  <Button onClick={handleCallNow} className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 text-sm lg:text-base">
                    <Phone className="w-4 h-4 lg:w-5 lg:h-5" />
                    Call Now
                  </Button>
                  <Button onClick={handleSendMessage} variant="outline" className="w-full flex items-center justify-center gap-2 text-sm lg:text-base">
                    <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Message Form Modal */}
      {showMessageForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Send Message to Landlord</h3>
                <button onClick={() => setShowMessageForm(false)} className="text-foreground/70 hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={messageForm.name}
                    onChange={handleMessageChange}
                    placeholder="Your name"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={messageForm.email}
                    onChange={handleMessageChange}
                    placeholder="your@email.com"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone (Optional)</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={messageForm.phone}
                    onChange={handleMessageChange}
                    placeholder="Your phone number"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                  <Textarea
                    name="message"
                    value={messageForm.message}
                    onChange={handleMessageChange}
                    placeholder="Tell the landlord about your interest..."
                    required
                    className="w-full min-h-24"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={createInquiryMutation.isPending}>
                    {createInquiryMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowMessageForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
