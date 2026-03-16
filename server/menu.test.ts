import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(isAdmin: boolean = false): TrpcContext {
  return {
    user: isAdmin
      ? {
          id: 1,
          openId: "admin-user",
          email: "admin@example.com",
          name: "Admin User",
          loginMethod: "manus",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : {
          id: 2,
          openId: "regular-user",
          email: "user@example.com",
          name: "Regular User",
          loginMethod: "manus",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Menu Routes", () => {
  it("should fetch menu categories", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.menu.categories();
    expect(Array.isArray(categories)).toBe(true);
  });

  it("should fetch menu items by category", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    // Assuming category ID 1 exists
    const items = await caller.menu.itemsByCategory({ categoryId: 1 });
    expect(Array.isArray(items)).toBe(true);
  });

  it("should fetch all menu items", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const items = await caller.menu.all();
    expect(Array.isArray(items)).toBe(true);
  });

  it("should get menu item by ID", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    // Assuming menu item ID 1 exists
    const item = await caller.menu.getById({ id: 1 });
    if (item) {
      expect(item.id).toBe(1);
      expect(item.name).toBeDefined();
      expect(item.price).toBeDefined();
    }
  });

  it("should not allow non-admin to create menu item", async () => {
    const ctx = createContext(false);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.menu.create({
        categoryId: 1,
        name: "Test Item",
        price: "10.00",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to create menu item", async () => {
    const ctx = createContext(true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.menu.create({
      categoryId: 1,
      name: "Test Item",
      description: "Test Description",
      price: "10.00",
    });

    expect(result).toBeDefined();
  });
});

describe("Order Routes", () => {
  it("should not allow unauthenticated user to create order", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.order.create({
        orderType: "pickup",
        items: [],
        totalAmount: "0",
      });
      expect.fail("Should have thrown UNAUTHORIZED error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should fetch user orders", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.order.getUserOrders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("should not allow non-admin to fetch all orders", async () => {
    const ctx = createContext(false);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.order.all();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to fetch all orders", async () => {
    const ctx = createContext(true);
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.order.all();
    expect(Array.isArray(orders)).toBe(true);
  });
});

describe("Inquiry Routes", () => {
  it("should allow public user to create inquiry", async () => {
    const ctx = createContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.inquiry.create({
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject",
      message: "Test Message",
    });

    expect(result).toBeDefined();
  });

  it("should not allow non-admin to fetch all inquiries", async () => {
    const ctx = createContext(false);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.inquiry.all();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to fetch all inquiries", async () => {
    const ctx = createContext(true);
    const caller = appRouter.createCaller(ctx);

    const inquiries = await caller.inquiry.all();
    expect(Array.isArray(inquiries)).toBe(true);
  });
});
