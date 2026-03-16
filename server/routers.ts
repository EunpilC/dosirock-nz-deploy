import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { paymentRouter } from "./routers/payment";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Menu routers
  menu: router({
    categories: publicProcedure.query(() => db.getMenuCategories()),
    itemsByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(({ input }) => db.getMenuItemsByCategory(input.categoryId)),
    all: publicProcedure.query(() => db.getAllMenuItems()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getMenuItemById(input.id)),
    create: protectedProcedure
      .input(
        z.object({
          categoryId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          price: z.string(),
          imageUrl: z.string().optional(),
          isAvailable: z.number().optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return db.createMenuItem({
          categoryId: input.categoryId,
          name: input.name,
          description: input.description,
          price: input.price,
          imageUrl: input.imageUrl,
          isAvailable: input.isAvailable ?? 1,
          displayOrder: input.displayOrder ?? 0,
        });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          imageUrl: z.string().optional(),
          isAvailable: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const { id, ...data } = input;
        return db.updateMenuItem(id, data);
      }),
  }),

  // Order routers
  order: router({
    create: protectedProcedure
      .input(
        z.object({
          orderType: z.enum(["pickup", "delivery"]),
          pickupTime: z.date().optional(),
          deliveryAddress: z.string().optional(),
          specialRequests: z.string().optional(),
          items: z.array(
            z.object({
              menuItemId: z.number(),
              quantity: z.number(),
              priceAtOrder: z.string(),
            })
          ),
          totalAmount: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const pendingStatus = await db.getOrderStatusByName("pending");
        if (!pendingStatus) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const order = await db.createOrder({
          userId: ctx.user!.id,
          totalAmount: input.totalAmount,
          orderStatusId: pendingStatus.id,
          orderType: input.orderType,
          pickupTime: input.pickupTime,
          deliveryAddress: input.deliveryAddress,
          specialRequests: input.specialRequests,
        });

        // Insert order items
        const orderId = (order as any).insertId as number;
        for (const item of input.items) {
          await db.createOrderItem({
            orderId,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder,
          });
        }

        return order;
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.userId !== ctx.user!.id && ctx.user?.role !== "admin")
          throw new TRPCError({ code: "FORBIDDEN" });
        return order;
      }),
    getUserOrders: protectedProcedure.query(({ ctx }) => db.getUserOrders(ctx.user!.id)),
    all: protectedProcedure.query(({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.getAllOrders();
    }),
    updateStatus: protectedProcedure
      .input(z.object({ orderId: z.number(), statusId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return db.updateOrderStatus(input.orderId, input.statusId);
      }),
    getItems: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(({ input }) => db.getOrderItems(input.orderId)),
  }),

  // Gallery routers
  gallery: router({
    all: publicProcedure.query(() => db.getGalleryImages()),
    create: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return db.createGalleryImage({
          imageUrl: input.imageUrl,
          title: input.title,
          description: input.description,
          category: input.category,
        });
      }),
  }),

  // Inquiry routers
  inquiry: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          subject: z.string(),
          message: z.string(),
        })
      )
      .mutation(({ input }) => db.createInquiry(input)),
    all: protectedProcedure.query(({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.getInquiries();
    }),
    updateStatus: protectedProcedure
      .input(z.object({ inquiryId: z.number(), status: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return db.updateInquiryStatus(input.inquiryId, input.status);
      }),
  }),

  // Payment router
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
