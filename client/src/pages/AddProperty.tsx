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
                  Join thousands of landlords listing properties on AllYouNeed Property
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
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.765 8.035 11.591.6.111.82-.26.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.217.694.825.576C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Continue with Google
                </Button>
                <Button
                  onClick={() => window.location.href = getLoginUrl()}
                  className="w-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = URL.createObjectURL(file);
      const newImage = { file, preview, uploading: false };
      setUploadedImages((prev) => [...prev, newImage]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.title || !formData.price || !formData.beds || !formData.baths || !formData.address || !formData.city) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    try {
      const property = await createPropertyMutation.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        price: parseInt(formData.price),
        currency: "HUF",
        beds: parseInt(formData.beds),
        baths: parseInt(formData.baths),
        sqm: formData.sqm ? parseInt(formData.sqm) : undefined,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        zipCode: formData.zipCode || undefined,
        type: formData.type,
        petFriendly: formData.petFriendly,
        parking: formData.parking,
      });
    } catch (error) {
      console.error("Error creating property:", error);
    }
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/70">Welcome, {user?.name}!</span>
            <Button variant="outline" size="sm" onClick={() => setLocation("/listings")} className="text-xs lg:text-sm">
              ← Back to Listings
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 lg:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">List Your Property</h1>
            <p className="text-foreground/70">Fill in the details below to post your rental property on AllYouNeed Property</p>
          </div>

          {submitSuccess && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="pt-6 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800">Property created successfully! Redirecting to listings...</p>
              </CardContent>
            </Card>
          )}

          {submitError && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{submitError}</p>
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
                  <label className="block text-sm font-medium text-foreground mb-2">Property Title *</label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Cozy 2-bedroom apartment in downtown"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your property, amenities, and what makes it special..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Details */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Monthly Price (HUF) *</label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 150000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Property Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="room">Room</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="studio">Studio</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bedrooms *</label>
                    <Input
                      type="number"
                      name="beds"
                      value={formData.beds}
                      onChange={handleInputChange}
                      placeholder="e.g., 2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Bathrooms *</label>
                    <Input
                      type="number"
                      name="baths"
                      value={formData.baths}
                      onChange={handleInputChange}
                      placeholder="e.g., 1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Square Meters</label>
                    <Input
                      type="number"
                      name="sqm"
                      value={formData.sqm}
                      onChange={handleInputChange}
                      placeholder="e.g., 75"
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
                  <label className="block text-sm font-medium text-foreground mb-2">Address *</label>
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
                    <label className="block text-sm font-medium text-foreground mb-2">City *</label>
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
                    <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                    <Input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g., Hungary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">ZIP Code</label>
                    <Input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="e.g., 1011"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="petFriendly"
                      checked={formData.petFriendly}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-foreground">Pet Friendly</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="parking"
                      checked={formData.parking}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-foreground">Parking Available</span>
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
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition"
                >
                  <Upload className="w-8 h-8 text-foreground/50 mx-auto mb-2" />
                  <p className="text-foreground font-medium">Click to upload images</p>
                  <p className="text-sm text-foreground/70">or drag and drop</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createPropertyMutation.isPending}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {createPropertyMutation.isPending ? "Publishing..." : "Publish Property"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/listings")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
