# Rentberry Reference Analysis

## Key Features Observed

### Navigation & Header
- Top navigation bar with logo, search input, "List a Property", "Log In" buttons
- Search input for city, address, or ZIP code
- Secondary navigation: Payments, Screening

### Search & Filtering
- Filter buttons: Price, Type, Beds, Baths, Filters (with count), Clear All
- Sort dropdown: "Best Match"
- Active filters display with clear option
- Results count: "394 listings found"

### Property Listing Cards
- Grid layout (4 columns on desktop)
- Each card shows:
  - Property image (with image count badge)
  - Price (HUF 190,280)
  - Number of beds (5)
  - Number of baths (1)
  - Square meters (optional)
  - Address/Location
  - "Instant Apply" button
  - Heart icon (favorite/wishlist)
  - More options button (three dots)

### Additional Features
- "Save Search" button
- "Show Map" button (map view toggle)
- Pagination: "Showing 1-22 of 394 Matches"
- City statistics section with listings count, min rent, pet-friendly, parking info

## Design Elements
- Color scheme: Purple/pink accents for buttons and highlights
- Card-based grid layout
- Badges for filter counts and property features
- Clear visual hierarchy with large price display

## Implementation Plan

### Database Schema
- Properties table (id, title, price, beds, baths, sqm, address, city, country, images, description, owner_id, created_at)
- Users table (already provided)
- Favorites/Wishlist table (user_id, property_id)
- Images table (property_id, image_url, order)

### Frontend Pages
1. Home/Landing page
2. Property listings page with filters and search
3. Property detail page
4. User dashboard (favorites, listings)
5. List a property page (for owners)

### API Endpoints (tRPC procedures)
- properties.search (with filters)
- properties.getById
- properties.create
- properties.update
- properties.delete
- favorites.toggle
- favorites.list
- users.profile
