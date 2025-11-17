import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Eye, MessageSquare, Home, TrendingUp, Edit } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: properties } = trpc.landlord.myProperties.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: inquiries } = trpc.landlord.myInquiries.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: stats } = trpc.landlord.dashboardStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deletePropertyMutation = trpc.properties.delete.useMutation({
    onSuccess: () => {
      // Refresh properties list
      window.location.reload();
    },
  });

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-border sticky top-0 z-40">
          <div className="container py-4 flex items-center justify-between px-4">
            <h1 className="text-2xl font-bold text-foreground">Landlord Dashboard</h1>
          </div>
        </header>

        <div className="container py-16 px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Sign In Required</h2>
          <p className="text-foreground/70 mb-8">Please sign in to access your landlord dashboard and manage your properties.</p>
          <a href={getLoginUrl()}>
            <Button size="lg">Sign In with Google or Facebook</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-foreground">Landlord Dashboard</h1>
          <Button onClick={() => setLocation("/add-property")} className="gap-2">
            <Plus className="w-4 h-4" />
            List New Property
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-4">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalInquiries || 0}</div>
              <p className="text-xs text-muted-foreground">Messages received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
              <p className="text-xs text-muted-foreground">Total profile views</p>
            </CardContent>
          </Card>
        </div>

        {/* Properties Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">My Properties</h2>
          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-foreground/70">
                        <strong>Price:</strong> {property.price} {property.currency}
                      </p>
                      <p className="text-sm text-foreground/70">
                        <strong>Location:</strong> {property.city}, {property.country}
                      </p>
                      <p className="text-sm text-foreground/70">
                        <strong>Type:</strong> {property.type}
                      </p>
                      <p className="text-sm text-foreground/70">
                        <strong>Beds/Baths:</strong> {property.beds}/{property.baths}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setLocation(`/property/${property.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setLocation(`/edit-property?id=${property.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this property?")) {
                            deletePropertyMutation.mutate(property.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-foreground/70 mb-4">You haven't listed any properties yet.</p>
                <Button onClick={() => setLocation("/add-property")}>List Your First Property</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Inquiries Section */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Inquiries</h2>
          {inquiries && inquiries.length > 0 ? (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <Card key={inquiry.contact.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-foreground/70">
                          <strong>Property:</strong> {inquiry.property.title}
                        </p>
                        <p className="text-sm text-foreground/70">
                          <strong>From:</strong> {inquiry.contact.name}
                        </p>
                        <p className="text-sm text-foreground/70">
                          <strong>Email:</strong> {inquiry.contact.email}
                        </p>
                        {inquiry.contact.phone && (
                          <p className="text-sm text-foreground/70">
                            <strong>Phone:</strong> {inquiry.contact.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-foreground/70">
                          <strong>Message:</strong>
                        </p>
                        <p className="text-sm text-foreground line-clamp-3">{inquiry.contact.message}</p>
                        <p className="text-xs text-foreground/50 mt-2">
                          {new Date(inquiry.contact.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-foreground/70">No inquiries yet. Keep your listings updated to attract more renters!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
