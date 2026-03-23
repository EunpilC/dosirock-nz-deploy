import Stripe from "stripe";
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  createPayment,
  getPaymentByStripeId,
  updatePaymentStatus,
  getUserPayments,
  getOrderById,
  updateUserStripeCustomerId,
} from "../db";
import { TRPCError } from "@trpc/server";
import { createLineItemsFromOrder } from "../stripe-products";

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_key";
const stripe = new Stripe(stripeKey);

export const paymentRouter = router({
  /**
   * Create a Stripe Checkout Session for an order
   * Returns the checkout URL to redirect the user
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        items: z.array(
          z.object({
            menuItemId: z.number(),
            name: z.string(),
            price: z.string(),
            quantity: z.number(),
          })
        ),
        totalAmount: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify order exists and belongs to user
        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        if (order.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to access this order",
          });
        }

        // Create or get Stripe customer
        let customerId = ctx.user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            name: ctx.user.name || undefined,
            metadata: {
              userId: ctx.user.id.toString(),
            },
          });
          customerId = customer.id;
          if (customerId) {
            await updateUserStripeCustomerId(ctx.user.id, customerId);
          }
        }

        if (!customerId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create or retrieve Stripe customer",
          });
        }

        // Create line items from order
        const lineItems = createLineItemsFromOrder(input.items);

        // Get origin from request headers for success/cancel URLs
        const origin = ctx.req.headers.origin || "https://example.com";

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${origin}/orders?success=true&orderId=${input.orderId}`,
          cancel_url: `${origin}/orders?cancelled=true&orderId=${input.orderId}`,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            userId: ctx.user.id.toString(),
            orderId: input.orderId.toString(),
            customerEmail: ctx.user.email || "",
            customerName: ctx.user.name || "",
          },
          allow_promotion_codes: true,
        });

        if (!session.url) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create checkout session",
          });
        }

        return {
          checkoutUrl: session.url,
          sessionId: session.id,
        };
      } catch (error) {
        console.error("[Payment] Error creating checkout session:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }
    }),

  /**
   * Get payment history for the current user
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const payments = await getUserPayments(ctx.user.id);
      return payments;
    } catch (error) {
      console.error("[Payment] Error fetching payment history:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch payment history",
      });
    }
  }),

  /**
   * Get payment details by Stripe Payment Intent ID
   */
  getPaymentDetails: protectedProcedure
    .input(z.object({ stripePaymentIntentId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const payment = await getPaymentByStripeId(input.stripePaymentIntentId);

        if (!payment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Payment not found",
          });
        }

        if (payment.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to access this payment",
          });
        }

        return payment;
      } catch (error) {
        console.error("[Payment] Error fetching payment details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch payment details",
        });
      }
    }),
});
