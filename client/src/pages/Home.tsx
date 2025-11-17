import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation, Link } from "wouter";
import { Search, MapPin, Home as HomeIcon, Users } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchCity, setSearchCity] = useState("");
  const { data: stats } = trpc.statistics.getStats.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setLocation(`/listings?city=${encodeURIComponent(searchCity)}`);
    } else {
      setLocation("/listings");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3 lg:py-4">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-6 h-6 lg:w-8 lg:h-8" />
            <span className="text-lg lg:text-xl font-bold text-foreground">Rental Property Center</span>
          </div>

               <nav className="hidden md:flex items-center gap-6">
            <Link href="/listings" className="text-foreground/60 hover:text-foreground transition-colors">
              Browse Rentals
            </Link>
            <Link href="/favorites" className="text-foreground/60 hover:text-foreground transition-colors">
              Favorites
            </Link>
            <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors">
              Payments
            </Link>
            <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors">
              Screening
            </Link>
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-xs lg:text-sm text-foreground/70">Welcome, {user?.name}!</span>
                <Button variant="outline" onClick={() => setLocation("/dashboard")} size="sm" className="text-xs lg:text-sm">
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => {
                  logoutMutation.mutate(undefined, {
                    onSuccess: () => {
                      window.location.href = "/";
                    },
                  });
                }} size="sm" className="text-xs lg:text-sm">
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => (window.location.href = getLoginUrl())} size="sm" className="text-xs lg:text-sm">
                  Log In
                </Button>
              </>
            )}
            <Button className="bg-primary hover:bg-primary/90 text-xs lg:text-sm" onClick={() => setLocation("/add-property")}>
              List a Property
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-12 md:py-20 lg:py-24">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 lg:mb-4">
              Find Your Perfect Rental Home
            </h1>
            <p className="text-base sm:text-lg text-foreground/70 mb-6 lg:mb-8">
              Search thousands of rental properties in your favorite cities
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
            <div className="flex flex-col md:flex-row gap-3 lg:gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Type in a city, address, or ZIP code"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-10 h-10 lg:h-12 text-sm lg:text-base"
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90 h-10 lg:h-12 px-4 lg:px-8 flex items-center gap-2 text-sm lg:text-base whitespace-nowrap">
                <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-8 md:py-12 lg:py-16 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 lg:mb-2">{stats?.totalProperties || 0}</div>
              <p className="text-xs sm:text-sm lg:text-base text-foreground/70">Properties Available</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 lg:mb-2">{stats?.totalCities || 0}</div>
              <p className="text-xs sm:text-sm lg:text-base text-foreground/70">Cities Covered</p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 lg:mb-2">{stats?.totalUsers || 0}</div>
              <p className="text-xs sm:text-sm lg:text-base text-foreground/70">Happy Renters</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-background">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-8 lg:mb-12 text-center">Why Choose Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white rounded-lg p-6 lg:p-8 border border-border hover:shadow-lg transition">
              <HomeIcon className="w-10 h-10 lg:w-12 lg:h-12 text-primary mb-3 lg:mb-4" />
              <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2 lg:mb-3">Wide Selection</h3>
              <p className="text-sm lg:text-base text-foreground/70">
                Browse thousands of properties from rooms to entire houses in your favorite locations.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 lg:p-8 border border-border hover:shadow-lg transition">
              <Users className="w-10 h-10 lg:w-12 lg:h-12 text-primary mb-3 lg:mb-4" />
              <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2 lg:mb-3">Verified Landlords</h3>
              <p className="text-sm lg:text-base text-foreground/70">
                All landlords are verified and screened to ensure safe and reliable rental transactions.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 lg:p-8 border border-border hover:shadow-lg transition">
              <Search className="w-10 h-10 lg:w-12 lg:h-12 text-primary mb-3 lg:mb-4" />
              <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2 lg:mb-3">Easy Search</h3>
              <p className="text-sm lg:text-base text-foreground/70">
                Advanced filters help you find properties that match your budget and preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-12 md:py-16 lg:py-20">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 lg:mb-4">Ready to Find Your Home?</h2>
          <p className="text-base sm:text-lg mb-6 lg:mb-8 opacity-90">Start browsing our listings today and find your perfect rental.</p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 text-sm lg:text-base"
            onClick={() => setLocation("/listings")}
          >
            Browse All Listings
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border py-8 md:py-12 mt-auto">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm lg:text-base">About Us</h4>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <a href="#" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    About {APP_TITLE}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm lg:text-base">For Renters</h4>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <a href="/listings" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    Browse Listings
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    Safety Tips
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm lg:text-base">For Landlords</h4>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <a href="/list-property" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    List a Property
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    Resources
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm lg:text-base">Legal</h4>
              <ul className="space-y-1 md:space-y-2">
                <li>
                  <a href="#" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-xs md:text-sm text-foreground/70 hover:text-foreground transition">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 md:pt-8 text-center text-xs md:text-sm text-foreground/70">
            <p>&copy; 2025 Rental Property Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
