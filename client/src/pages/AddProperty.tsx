import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, AlertCircle, CheckCircle } from "lucide-react";

export default function AddProperty() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <p className="font-semibold">Authentication Required</p>
            </div>
            <p className="text-foreground/70 mb-6">
              You need to be logged in to post a property. Please log in first.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="w-full"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    // Validation
    if (!formData.title.trim()) {
      setSubmitError("Property title is required");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setSubmitError("Valid price is required");
      return;
    }
    if (!formData.beds || Number(formData.beds) < 0) {
      setSubmitError("Number of bedrooms is required");
      return;
    }
    if (!formData.baths || Number(formData.baths) < 0) {
      setSubmitError("Number of bathrooms is required");
      return;
    }
    if (!formData.address.trim()) {
      setSubmitError("Address is required");
      return;
    }
    if (!formData.city.trim()) {
      setSubmitError("City is required");
      return;
    }

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const imageData of uploadedImages) {
        if (imageData.uploading || imageData.error) continue;

        const formDataForUpload = new FormData();
        formDataForUpload.append("file", imageData.file);

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formDataForUpload,
          });

          if (!response.ok) {
            throw new Error("Image upload failed");
          }

          const result = await response.json();
          imageUrls.push(result.url);
        } catch (error) {
          console.error("Failed to upload image:", error);
        }
      }

      // Create property with image URLs
      createPropertyMutation.mutate({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        currency: "HUF",
        beds: Number(formData.beds),
        baths: Number(formData.baths),
        sqm: formData.sqm ? Number(formData.sqm) : undefined,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        zipCode: formData.zipCode,
        type: formData.type,
        petFriendly: formData.petFriendly,
        parking: formData.parking,
      });

      // Store image URLs separately (we'll handle this in the next step)
      if (imageUrls.length > 0) {
        sessionStorage.setItem("propertyImages", JSON.stringify(imageUrls));
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit property"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Post Your Property
          </h1>
          <p className="text-foreground/70">
            Fill in the details below to list your rental property
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {submitError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800">{submitError}</p>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800">
                    Property posted successfully! Redirecting to listings...
                  </p>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Property Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Modern 2BR Apartment in Budapest"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your property, amenities, and neighborhood..."
                    rows={5}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Monthly Rent (HUF) *
                    </label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 2500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Property Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="studio">Studio</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="room">Room</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Property Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Property Features
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Bedrooms *
                    </label>
                    <Input
                      type="number"
                      name="beds"
                      value={formData.beds}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Bathrooms *
                    </label>
                    <Input
                      type="number"
                      name="baths"
                      value={formData.baths}
                      onChange={handleInputChange}
                      placeholder="1"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Square Meters
                    </label>
                    <Input
                      type="number"
                      name="sqm"
                      value={formData.sqm}
                      onChange={handleInputChange}
                      placeholder="e.g., 50"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="petFriendly"
                      checked={formData.petFriendly}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Pet Friendly
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="parking"
                      checked={formData.parking}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Parking Available
                    </span>
                  </label>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Location
                </h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address *
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., 123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City *
                    </label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Budapest"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Country *
                    </label>
                    <Input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled
                      className="bg-foreground/5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      ZIP Code
                    </label>
                    <Input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="e.g., 1011"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Property Photos
                </h3>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition"
                >
                  <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-medium text-foreground mb-1">
                    Click to upload photos
                  </p>
                  <p className="text-sm text-foreground/70">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden bg-foreground/5"
                      >
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t border-border">
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
                  {createPropertyMutation.isPending
                    ? "Posting..."
                    : "Post Property"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
