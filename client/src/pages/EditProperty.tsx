import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Upload, X, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function EditProperty() {
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get("id") ? parseInt(params.get("id")!) : null;
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch property details
  const { data: property, isLoading: propertyLoading } = trpc.properties.getById.useQuery(
    propertyId || 0,
    { enabled: propertyId !== null && isAuthenticated }
  );

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
    Array<{ file?: File; preview: string; uploading: boolean; error?: string; id?: number }>
  >([]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Update form when property loads
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        price: property.price?.toString() || "",
        beds: property.beds?.toString() || "",
        baths: property.baths?.toString() || "",
        sqm: property.sqm?.toString() || "",
        address: property.address || "",
        city: property.city || "",
        country: property.country || "Hungary",
        zipCode: property.zipCode || "",
        type: property.type || "apartment",
        petFriendly: property.petFriendly || false,
        parking: property.parking || false,
      });

      if (property.images) {
        setUploadedImages(
          property.images.map((img) => ({
            preview: img.imageUrl,
            uploading: false,
            id: img.id,
          }))
        );
      }
    }
  }, [property]);

  const updatePropertyMutation = trpc.properties.update.useMutation({
    onSuccess: () => {
      setSubmitSuccess(true);
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    },
    onError: (error) => {
      setSubmitError(error.message || "Failed to update property");
    },
  });

  // Handle loading state
  if (loading || propertyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-foreground/60">Loading property details...</p>
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
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
                  <p className="text-foreground/60">
                    Please log in to edit your properties.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Handle property not found or not owned by user
  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-center h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Property not found</h2>
                  <p className="text-foreground/60">
                    The property you're trying to edit doesn't exist or you don't have permission to edit it.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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

    updatePropertyMutation.mutate({
      id: propertyId!,
      title: formData.title,
      description: formData.description,
      price: parseInt(formData.price),
      beds: parseInt(formData.beds),
      baths: parseInt(formData.baths),
      sqm: parseInt(formData.sqm),
      address: formData.address,
      city: formData.city,
      country: formData.country,
      zipCode: formData.zipCode,
      type: formData.type,
      petFriendly: formData.petFriendly,
      parking: formData.parking,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="outline"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Edit Property
          </h1>
          <p className="text-foreground/60">
            Update your property details and images
          </p>
        </div>

        {submitSuccess && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Property updated successfully!</p>
                  <p className="text-sm text-green-800">Redirecting to dashboard...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {submitError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-800">{submitError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Spacious 2BR Apartment in Budapest"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
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
                  <label className="block text-sm font-medium mb-2">
                    Monthly Price (HUF) *
                  </label>
                  <Input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="1500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="studio">Studio</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="room">Room</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bedrooms *
                  </label>
                  <Input
                    name="beds"
                    type="number"
                    value={formData.beds}
                    onChange={handleInputChange}
                    placeholder="2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bathrooms *
                  </label>
                  <Input
                    name="baths"
                    type="number"
                    value={formData.baths}
                    onChange={handleInputChange}
                    placeholder="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Size (m²)
                  </label>
                  <Input
                    name="sqm"
                    type="number"
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
                <label className="block text-sm font-medium mb-2">
                  Address *
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Budapest"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ZIP Code
                  </label>
                  <Input
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="1011"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Country *
                </label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Hungary"
                  required
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
                  name="petFriendly"
                  checked={formData.petFriendly}
                  onChange={handleInputChange}
                  id="petFriendly"
                  className="w-4 h-4"
                />
                <label htmlFor="petFriendly" className="text-sm font-medium cursor-pointer">
                  Pet Friendly
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="parking"
                  checked={formData.parking}
                  onChange={handleInputChange}
                  id="parking"
                  className="w-4 h-4"
                />
                <label htmlFor="parking" className="text-sm font-medium cursor-pointer">
                  Parking Available
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Click to upload images</p>
                <p className="text-xs text-foreground/60">PNG, JPG, GIF up to 10MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {image.uploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                      {image.error && (
                        <div className="absolute inset-0 bg-red-500/50 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/dashboard")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updatePropertyMutation.isPending}
            >
              {updatePropertyMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
