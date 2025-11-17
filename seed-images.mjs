import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "rental_app",
});

try {
  // Get all properties
  const [properties] = await connection.query("SELECT id FROM properties");

  console.log(`Found ${properties.length} properties`);

  // Array of placeholder image URLs (using public placeholder service)
  const placeholderImages = [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9b274b3f5798?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505873242700-f289a29e7e0f?w=800&h=600&fit=crop",
  ];

  // Insert images for each property
  for (const property of properties) {
    // Add 2-4 images per property
    const imageCount = Math.floor(Math.random() * 3) + 2;
    const selectedImages = [];

    for (let i = 0; i < imageCount; i++) {
      const randomImage =
        placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      selectedImages.push(randomImage);
    }

    // Insert images
    for (const imageUrl of selectedImages) {
      await connection.query(
        "INSERT INTO propertyImages (propertyId, imageUrl) VALUES (?, ?)",
        [property.id, imageUrl]
      );
    }
  }

  console.log("✅ Successfully added placeholder images to all properties");
} catch (error) {
  console.error("Error:", error);
} finally {
  await connection.end();
}
