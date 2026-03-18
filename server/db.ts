import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, menuCategories, menuItems, orders, orderItems, orderStatus, galleryImages, inquiries, payments, locations, InsertMenuCategory, InsertMenuItem, InsertOrder, InsertOrderItem, InsertGalleryImage, InsertInquiry, InsertPayment, InsertLocation, Location } from "../drizzle/schema";
import { ENV } from './_core/env';

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

// Menu queries
export async function getMenuCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuCategories).orderBy((c) => c.displayOrder);
}

export async function getMenuItemsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.categoryId, categoryId), eq(menuItems.isAvailable, 1)))
    .orderBy((m) => m.displayOrder);
}

export async function getAllMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(eq(menuItems.isAvailable, 1));
}

export async function getMenuItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createMenuItem(data: InsertMenuItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(menuItems).values(data);
  return result;
}

export async function updateMenuItem(id: number, data: Partial<InsertMenuItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuItems).set(data).where(eq(menuItems.id, id));
}

export async function deleteMenuItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(menuItems).where(eq(menuItems.id, id));
}

export async function getMenuCategoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(menuCategories).where(eq(menuCategories.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createMenuCategory(data: InsertMenuCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(menuCategories).values(data);
  return result;
}

export async function updateMenuCategory(id: number, data: Partial<InsertMenuCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuCategories).set(data).where(eq(menuCategories.id, id));
}

// Order queries
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy((o) => desc(o.createdAt));
}

export async function updateOrderStatus(id: number, statusId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ statusId: statusId }).where(eq(orders.id, id));
}

export async function createOrderItem(data: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(data);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy((o) => desc(o.createdAt));
}

// Gallery queries
export async function getGalleryImages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(galleryImages).orderBy((g) => g.displayOrder);
}

export async function createGalleryImage(data: InsertGalleryImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(galleryImages).values(data);
}

// Inquiry queries
export async function createInquiry(data: InsertInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(inquiries).values(data);
}

export async function getInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquiries).orderBy((i) => desc(i.createdAt));
}

export async function updateInquiryStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(inquiries).set({ status: status as any }).where(eq(inquiries.id, id));
}

// Order status queries
export async function getOrderStatuses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderStatus);
}

export async function getOrderStatusByName(statusName: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orderStatus).where(eq(orderStatus.statusName, statusName)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Payment queries
export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(payments).values(payment);
  return result;
}

export async function getPaymentByStripeId(stripePaymentIntentId: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(
  stripePaymentIntentId: string,
  status: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
}

export async function getUserPayments(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(payments).where(eq(payments.userId, userId));
}

// User Stripe customer ID
export async function updateUserStripeCustomerId(
  userId: number,
  stripeCustomerId: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(users)
    .set({ stripeCustomerId, updatedAt: new Date() })
    .where(eq(users.id, userId));
}


// Location queries
export async function getLocations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(locations).where(eq(locations.isActive, 1)).orderBy((l) => l.displayOrder);
}

export async function getLocationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createLocation(data: InsertLocation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(locations).values(data);
}

export async function updateLocation(id: number, data: Partial<InsertLocation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(locations).set(data).where(eq(locations.id, id));
}

export async function deleteLocation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(locations).set({ isActive: 0 }).where(eq(locations.id, id));
}
