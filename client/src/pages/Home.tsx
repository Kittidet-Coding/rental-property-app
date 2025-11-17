import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Search, MapPin, Home as HomeIcon, Users } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchCity, setSearchCity] = useState("");

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
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8" />
            <span className="text-xl font-bold text-foreground">{APP_TITLE}</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="/listings" className="text-foreground hover:text-primary transition">
              Browse Rentals
            </a>
            <a href="#" className="text-foreground hover:text-primary transition">
              Payments
            </a>
            <a href="#" className="text-foreground hover:text-primary transition">
              Screening
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => (window.location.href = getLoginUrl())}>
                  Log In
                </Button>
              </>
            )}
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setLocation("/list-property")}>
              List a Property
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16 md:py-24">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Find Your Perfect Rental Home
            </h1>
            <p className="text-lg text-foreground/70 mb-8">
              Search thousands of rental properties in your favorite cities
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Type in a city, address, or ZIP code"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90 h-12 px-8 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <p className="text-foreground/70">Properties Available</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-foreground/70">Cities Covered</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100K+</div>
              <p className="text-foreground/70">Happy Renters</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why Choose Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 border border-border hover:shadow-lg transition">
              <HomeIcon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Wide Selection</h3>
              <p className="text-foreground/70">
                Browse thousands of properties from rooms to entire houses in your favorite locations.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-border hover:shadow-lg transition">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Verified Landlords</h3>
              <p className="text-foreground/70">
                All landlords are verified and screened to ensure safe and reliable rental transactions.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-border hover:shadow-lg transition">
              <Search className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">Easy Search</h3>
              <p className="text-foreground/70">
                Advanced filters help you find properties that match your budget and preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home?</h2>
          <p className="text-lg mb-8 opacity-90">Start browsing our listings today and find your perfect rental.</p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
            onClick={() => setLocation("/listings")}
          >
            Browse All Listings
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border py-8 mt-auto">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">About Us</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-foreground/70 hover:text-foreground transition">
                    About {APP_TITLE}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">For Renters</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/listings" className="text-foreground/70 hover:text-foreground transition">
                    Browse Listings
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-foreground transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-foreground transition">
                    Safety Tips
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">For Landlords</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/list-property" className="text-foreground/70 hover:text-foreground transition">
                    List a Property
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-foreground transition">
                    Resources
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-foreground/70 hover:text-foreground transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-foreground transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-foreground/70 hover:text-foreground transition">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-foreground/70">
            <p>&copy; 2024 {APP_TITLE}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
