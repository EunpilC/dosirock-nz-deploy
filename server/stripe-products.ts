/**
 * Stripe Products and Prices Configuration
 * Define all Stripe products and prices here for centralized management
 */

export const stripeProducts = {
  // Korean Lunch Box Products
  bento: {
    name: "Korean Lunch Box",
    description: "Delicious Korean lunch boxes",
    // Note: Individual menu items will be added to cart dynamically
  },
};

/**
 * Helper function to create line items for Stripe Checkout Session
 * Converts order items to Stripe line item format
 */
export function createLineItemsFromOrder(
  items: Array<{
    menuItemId: number;
    name: string;
    price: string;
    quantity: number;
  }>
) {
  return items.map((item) => ({
    price_data: {
      currency: "nzd",
      product_data: {
        name: item.name,
        metadata: {
          menuItemId: item.menuItemId.toString(),
        },
      },
      unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents
    },
    quantity: item.quantity,
  }));
}
