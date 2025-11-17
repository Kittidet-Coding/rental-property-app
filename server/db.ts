import { eq, gte, lte, and, like, or, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, properties, propertyImages, favorites, contacts } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { InsertProperty, Contact } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getProperties(filters?: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.city) {
    // Support both exact city match and country match
    // If city is "Hungary", search by country instead
    if (filters.city.toLowerCase() === "hungary") {
      conditions.push(eq(properties.country, "Hungary"));
    } else {
      // Otherwise do a case-insensitive partial match on city name
      conditions.push(like(properties.city, `%${filters.city}%`));
    }
  }
  if (filters?.minPrice) {
    conditions.push(gte(properties.price, filters.minPrice));
  }
  if (filters?.maxPrice) {
    conditions.push(lte(properties.price, filters.maxPrice));
  }
  if (filters?.beds) {
    conditions.push(eq(properties.beds, filters.beds));
  }
  if (filters?.baths) {
    conditions.push(eq(properties.baths, filters.baths));
  }
  if (filters?.type) {
    conditions.push(eq(properties.type, filters.type));
  }

  let query: any = db.select().from(properties);

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  const propertiesData = await query.execute();
  
  // Fetch images for each property
  const propertiesWithImages = await Promise.all(
    propertiesData.map(async (property: any) => {
      const images = await getPropertyImages(property.id);
      return { ...property, images };
    })
  );
  
  return propertiesWithImages;
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPropertyImages(propertyId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(propertyImages).where(eq(propertyImages.propertyId, propertyId)).orderBy(propertyImages.displayOrder);
}

export async function createProperty(data: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(properties).values(data);
  return result;
}

export async function updateProperty(id: number, data: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(properties).set(data).where(eq(properties.id, id));
}

export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(properties).where(eq(properties.id, id));
}

export async function toggleFavorite(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(favorites).where(
    and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))
  ).limit(1);

  if (existing.length > 0) {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))
    );
    return { isFavorite: false };
  } else {
    await db.insert(favorites).values({ userId, propertyId });
    return { isFavorite: true };
  }
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get all favorite properties with their details
  const favoriteList = await db
    .select({
      id: properties.id,
      title: properties.title,
      description: properties.description,
      price: properties.price,
      beds: properties.beds,
      baths: properties.baths,
      sqm: properties.sqm,
      address: properties.address,
      city: properties.city,
      country: properties.country,
      zipCode: properties.zipCode,
      type: properties.type,
      petFriendly: properties.petFriendly,
      parking: properties.parking,
      ownerId: properties.ownerId,
    })
    .from(favorites)
    .innerJoin(properties, eq(favorites.propertyId, properties.id))
    .where(eq(favorites.userId, userId));

  // Get images for each property
  const propertiesWithImages = await Promise.all(
    favoriteList.map(async (property) => {
      const images = await getPropertyImages(property.id);
      return { ...property, images };
    })
  );

  return propertiesWithImages;
}

export async function isFavorite(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(favorites).where(
    and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))
  ).limit(1);

  return result.length > 0;
}


export async function getStatistics() {
  const db = await getDb();
  if (!db) return { totalProperties: 0, totalCities: 0, totalUsers: 0 };

  try {
    // Get total properties count
    const propertiesResult = await db
      .select({ count: count() })
      .from(properties);
    const totalProperties = propertiesResult[0]?.count || 0;

    // Get unique cities count
    const citiesResult = await db
      .selectDistinct({ city: properties.city })
      .from(properties);
    const totalCities = citiesResult.length;

    // Get total users count
    const usersResult = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = usersResult[0]?.count || 0;

    return {
      totalProperties,
      totalCities,
      totalUsers,
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return { totalProperties: 0, totalCities: 0, totalUsers: 0 };
  }
}


// Landlord Dashboard Functions
export async function getLandlordProperties(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(properties).where(eq(properties.ownerId, ownerId));
}

export async function getLandlordInquiries(ownerId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get all inquiries for properties owned by this landlord
  return db
    .select({
      contact: contacts,
      property: properties,
    })
    .from(contacts)
    .innerJoin(properties, eq(contacts.propertyId, properties.id))
    .where(eq(properties.ownerId, ownerId))
    .orderBy(contacts.createdAt);
}

export async function getLandlordDashboardStats(ownerId: number) {
  const db = await getDb();
  if (!db) return { totalProperties: 0, totalInquiries: 0, totalViews: 0 };

  try {
    // Get landlord's properties count
    const propertiesResult = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.ownerId, ownerId));
    const totalProperties = propertiesResult[0]?.count || 0;

    // Get landlord's inquiries count
    const inquiriesResult = await db
      .select({ count: count() })
      .from(contacts)
      .innerJoin(properties, eq(contacts.propertyId, properties.id))
      .where(eq(properties.ownerId, ownerId));
    const totalInquiries = inquiriesResult[0]?.count || 0;

    return {
      totalProperties,
      totalInquiries,
      totalViews: 0,
    };
  } catch (error) {
    console.error("Error fetching landlord stats:", error);
    return { totalProperties: 0, totalInquiries: 0, totalViews: 0 };
  }
}


// Contact/Inquiry Functions
export async function createContact(data: {
  propertyId: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(contacts).values({
      propertyId: data.propertyId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to create contact:", error);
    throw error;
  }
}

export async function getContactById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
