import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, AlertCircle, CheckCircle, LogIn } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Textarea } from "@/components/ui/textarea";

export default function AddProperty() {
  // All hooks must be called at the top level, before any conditional returns
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    beds: "",
    baths: "",
    sqm: "",
    address: "",
    city: "",
    country: "Hungary",
    zipCode: "",
    type: "apartment",
    petFriendly: false,
    parking: false,
  });

  const [uploadedImages, setUploadedImages] = useState<
    Array<{ file: File; preview: string; uploading: boolean; error?: string }>
  >([]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createPropertyMutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      setSubmitSuccess(true);
      setTimeout(() => {
        setLocation("/listings");
      }, 2000);
    },
    onError: (error) => {
      setSubmitError(error.message || "Failed to create property");
    },
  });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication required screen
  if (!isAuthenticated) {
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

        <div className="container py-12 px-4 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign In to List Your Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-foreground/70 mb-2">
                  Join thousands of landlords listing properties on Rental Property Center
                </p>
                <p className="text-sm text-foreground/60">
                  Sign in with your Google or Facebook account to get started
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = getLoginUrl()}
                  className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </Button>
                <Button
                  onClick={() => window.location.href = getLoginUrl()}
                  className="w-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Sign in with Facebook
                </Button>
              </div>

              <div className="text-center text-sm text-foreground/60">
                <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated user form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const preview = URL.createObjectURL(file);
      setUploadedImages((prev) => [
        ...prev,
        { file, preview, uploading: true },
      ]);

      try {
        const formDataForUpload = new FormData();
        formDataForUpload.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataForUpload,
        });

        if (!response.ok) throw new Error("Upload failed");
        const { url } = await response.json();

        setUploadedImages((prev) =>
          prev.map((img) =>
            img.file === file
              ? { ...img, uploading: false, preview: url }
              : img
          )
        );
      } catch (error) {
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.file === file
              ? {
                  ...img,
                  uploading: false,
                  error: "Upload failed",
                }
              : img
          )
        );
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const imageUrls = uploadedImages
      .filter((img) => !img.error)
      .map((img) => img.preview);

    createPropertyMutation.mutate({
      title: formData.title,
      description: formData.description,
      price: parseInt(formData.price) || 0,
      beds: parseInt(formData.beds) || 0,
      baths: parseInt(formData.baths) || 0,
      sqm: parseInt(formData.sqm) || 0,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      zipCode: formData.zipCode,
      type: formData.type,
      petFriendly: formData.petFriendly,
      parking: formData.parking,
    });

    // Images are already uploaded via the /api/upload endpoint
  };

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

      <div className="container py-8 px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">List Your Property</h1>
          <p className="text-foreground/70">Fill in the details below to list your property on Rental Property Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Property Listed Successfully!</h3>
                <p className="text-sm text-green-800">Redirecting to listings...</p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Property Title *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Spacious 2BR Apartment in Budapest"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your property, amenities, and what makes it special..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Monthly Price (HUF) *
                  </label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="1500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Property Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="studio">Studio</option>
                    <option value="house">House</option>
                    <option value="room">Room</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Bedrooms
                  </label>
                  <Input
                    type="number"
                    name="beds"
                    value={formData.beds}
                    onChange={handleInputChange}
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Bathrooms
                  </label>
                  <Input
                    type="number"
                    name="baths"
                    value={formData.baths}
                    onChange={handleInputChange}
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Size (m²)
                  </label>
                  <Input
                    type="number"
                    name="sqm"
                    value={formData.sqm}
                    onChange={handleInputChange}
                    placeholder="65"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Address *
                </label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    City *
                  </label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Budapest"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    ZIP Code
                  </label>
                  <Input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="1011"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Country
                </label>
                <Input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="petFriendly"
                  name="petFriendly"
                  checked={formData.petFriendly}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-input"
                />
                <label htmlFor="petFriendly" className="text-sm font-medium text-foreground cursor-pointer">
                  Pet Friendly
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="parking"
                  name="parking"
                  checked={formData.parking}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-input"
                />
                <label htmlFor="parking" className="text-sm font-medium text-foreground cursor-pointer">
                  Parking Available
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-foreground/50 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Click to upload images</p>
                <p className="text-xs text-foreground/50">PNG, JPG, GIF up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                      {img.error && (
                        <div className="absolute inset-0 bg-red-500/50 rounded-lg flex items-center justify-center">
                          <p className="text-white text-xs text-center">{img.error}</p>
                        </div>
                      )}
                      {!img.uploading && !img.error && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/listings")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPropertyMutation.isPending}
              className="flex-1"
            >
              {createPropertyMutation.isPending ? "Listing..." : "List Property"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
