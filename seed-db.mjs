import mysql from 'mysql2/promise';

const sampleProperties = [
  {
    title: "Modern 2BR Apartment in Downtown",
    description: "Beautiful modern apartment with stunning city views. Recently renovated with high-end appliances and smart home features.",
    price: 2500,
    currency: "USD",
    beds: 2,
    baths: 2,
    sqm: 85,
    address: "123 Main Street, Suite 500",
    city: "New York",
    country: "USA",
    zipCode: "10001",
    latitude: "40.7128",
    longitude: "-74.0060",
    type: "apartment",
    petFriendly: true,
    parking: true,
    ownerId: 1,
  },
  {
    title: "Cozy Studio in Trendy Neighborhood",
    description: "Perfect for young professionals. Located in the heart of the vibrant neighborhood with easy access to restaurants and shops.",
    price: 1800,
    currency: "USD",
    beds: 1,
    baths: 1,
    sqm: 45,
    address: "456 Park Avenue",
    city: "New York",
    country: "USA",
    zipCode: "10022",
    latitude: "40.7614",
    longitude: "-73.9776",
    type: "studio",
    petFriendly: false,
    parking: false,
    ownerId: 1,
  },
  {
    title: "Spacious 3BR House with Garden",
    description: "Family-friendly house with a large backyard and garden. Perfect for families with children. Quiet residential area.",
    price: 3500,
    currency: "USD",
    beds: 3,
    baths: 2,
    sqm: 150,
    address: "789 Oak Lane",
    city: "Los Angeles",
    country: "USA",
    zipCode: "90001",
    latitude: "34.0522",
    longitude: "-118.2437",
    type: "house",
    petFriendly: true,
    parking: true,
    ownerId: 1,
  },
  {
    title: "Luxury Penthouse with Rooftop",
    description: "Stunning penthouse with panoramic views, rooftop terrace, and premium finishes. High-end building with concierge service.",
    price: 5000,
    currency: "USD",
    beds: 3,
    baths: 3,
    sqm: 200,
    address: "321 Luxury Tower",
    city: "San Francisco",
    country: "USA",
    zipCode: "94102",
    latitude: "37.7749",
    longitude: "-122.4194",
    type: "apartment",
    petFriendly: true,
    parking: true,
    ownerId: 1,
  },
  {
    title: "Charming 1BR in Historic District",
    description: "Charming apartment in a historic building with original hardwood floors and high ceilings. Walking distance to museums and cafes.",
    price: 2200,
    currency: "USD",
    beds: 1,
    baths: 1,
    sqm: 65,
    address: "555 Heritage Street",
    city: "Boston",
    country: "USA",
    zipCode: "02108",
    latitude: "42.3601",
    longitude: "-71.0589",
    type: "apartment",
    petFriendly: true,
    parking: false,
    ownerId: 1,
  },
  {
    title: "Modern Loft in Arts District",
    description: "Industrial-style loft with exposed brick, high ceilings, and large windows. Located in vibrant arts district with galleries and restaurants.",
    price: 2800,
    currency: "USD",
    beds: 2,
    baths: 1,
    sqm: 110,
    address: "888 Art Boulevard",
    city: "Miami",
    country: "USA",
    zipCode: "33101",
    latitude: "25.7617",
    longitude: "-80.1918",
    type: "apartment",
    petFriendly: true,
    parking: true,
    ownerId: 1,
  },
  {
    title: "Beachfront Studio with Ocean View",
    description: "Stunning beachfront property with direct access to the beach. Wake up to ocean views and enjoy the sunset from your balcony.",
    price: 3200,
    currency: "USD",
    beds: 1,
    baths: 1,
    sqm: 55,
    address: "100 Ocean Drive",
    city: "Miami Beach",
    country: "USA",
    zipCode: "33139",
    latitude: "25.7907",
    longitude: "-80.1300",
    type: "studio",
    petFriendly: false,
    parking: true,
    ownerId: 1,
  },
  {
    title: "Suburban Family Home",
    description: "Spacious suburban home perfect for families. Large yard, good schools nearby, and quiet neighborhood. Recently updated.",
    price: 2900,
    currency: "USD",
    beds: 4,
    baths: 2,
    sqm: 180,
    address: "222 Maple Drive",
    city: "Seattle",
    country: "USA",
    zipCode: "98101",
    latitude: "47.6062",
    longitude: "-122.3321",
    type: "house",
    petFriendly: true,
    parking: true,
    ownerId: 1,
  },
];

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rental_app',
  });

  try {
    console.log('Starting database seed...');

    // Insert sample properties
    for (const property of sampleProperties) {
      const query = `
        INSERT INTO properties (
          title, description, price, currency, beds, baths, sqm,
          address, city, country, zipCode, latitude, longitude,
          type, petFriendly, parking, ownerId, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const values = [
        property.title,
        property.description,
        property.price,
        property.currency,
        property.beds,
        property.baths,
        property.sqm,
        property.address,
        property.city,
        property.country,
        property.zipCode,
        property.latitude,
        property.longitude,
        property.type,
        property.petFriendly ? 1 : 0,
        property.parking ? 1 : 0,
        property.ownerId,
      ];

      await connection.execute(query, values);
      console.log(`✓ Added property: ${property.title}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
