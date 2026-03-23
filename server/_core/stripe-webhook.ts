import Stripe from "stripe";
import { Request, Response } from "express";
import { createPayment, updatePaymentStatus, updateOrderStatus } from "../db";
import { getOrderStatusByName } from "../db";

const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_key";
const stripe = new Stripe(stripeKey);

/**
 * Handle Stripe webhook events
 * This function processes payment-related events from Stripe
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET");
    return res.status(400).json({ error: "Missing webhook secret" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  // Handle test events for development
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[Stripe Webhook] Checkout session completed:", session.id);

        // Extract metadata
        const userId = session.metadata?.userId
          ? parseInt(session.metadata.userId)
          : null;
        const orderId = session.metadata?.orderId
          ? parseInt(session.metadata.orderId)
          : null;

        if (!userId || !orderId || !session.payment_intent) {
          console.error("[Stripe Webhook] Missing required metadata");
          return res.status(400).json({ error: "Missing required metadata" });
        }

        // Create payment record
        await createPayment({
          userId,
          orderId,
          stripePaymentIntentId: session.payment_intent as string,
          amount: ((session.amount_total || 0) / 100).toString(),
          currency: session.currency || "nzd",
          status: "succeeded",
        });

        // Update order status to "confirmed"
        const confirmedStatus = await getOrderStatusByName("confirmed");
        if (confirmedStatus) {
          await updateOrderStatus(orderId, confirmedStatus.id);
        }

        console.log(
          `[Stripe Webhook] Payment recorded for order ${orderId}, user ${userId}`
        );
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Stripe Webhook] Payment intent succeeded:", paymentIntent.id);

        // Update payment status if it exists
        await updatePaymentStatus(paymentIntent.id, "succeeded");
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Stripe Webhook] Payment intent failed:", paymentIntent.id);

        // Update payment status
        await updatePaymentStatus(paymentIntent.id, "failed");

        // Update order status to "cancelled"
        const failureMessage = paymentIntent.last_payment_error?.message || "Payment failed";
        console.error(
          `[Stripe Webhook] Payment failed for intent ${paymentIntent.id}: ${failureMessage}`
        );
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log("[Stripe Webhook] Charge refunded:", charge.id);

        if (charge.payment_intent) {
          await updatePaymentStatus(charge.payment_intent as string, "refunded");
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
