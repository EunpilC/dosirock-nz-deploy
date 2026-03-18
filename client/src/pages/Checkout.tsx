import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CartItem {
  menuItemId: number;
  name: string;
  price: string;
  priceAtOrder: string;
  quantity: number;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: locations } = trpc.location.all.useQuery();
  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation();
  const createOrderMutation = trpc.order.create.useMutation();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    // Set default location
    if (locations && locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  // Calculate total
  const calculateTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to checkout");
      setLocation("/");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!selectedLocationId) {
      toast.error("Please select a location");
      return;
    }

    if (orderType === "delivery" && !deliveryAddress) {
      toast.error("Please enter a delivery address");
      return;
    }

    if (orderType === "pickup" && !pickupTime) {
      toast.error("Please select a pickup time");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order first
      const totalAmount = calculateTotal();
      const orderResult = await createOrderMutation.mutateAsync({
        locationId: selectedLocationId,
        orderType,
        items: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          priceAtOrder: item.priceAtOrder,
        })),
        totalAmount,
        pickupTime: orderType === "pickup" ? new Date(pickupTime) : undefined,
        deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
        specialRequests: specialRequests || undefined,
      });

      // Get the order ID from the result
      const orderId = (orderResult as any).insertId as number;

      // Create Stripe checkout session
      const checkout = await createCheckoutMutation.mutateAsync({
        orderId,
        items: cartItems,
        totalAmount,
      });

      // Clear cart
      localStorage.removeItem("cart");
      setCartItems([]);

      // Redirect to Stripe checkout
      if (checkout.checkoutUrl) {
        window.open(checkout.checkoutUrl, "_blank");
        toast.success("Redirecting to payment...");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to process checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold text-[#1e7e34] mb-6">Checkout</h1>
        <p className="text-gray-600 mb-6">Your cart is empty</p>
        <Button
          size="lg"
          className="bg-[#1e7e34] hover:bg-[#0d5a1f]"
          onClick={() => setLocation("/menu")}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-[#1e7e34] mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location Selection */}
          <Card className="p-6 border-2 border-[#1e7e34]">
            <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Select Location</h2>
            <div className="space-y-3">
              {locations?.map((location) => (
                <div
                  key={location.id}
                  onClick={() => setSelectedLocationId(location.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedLocationId === location.id
                      ? "border-[#ffd700] bg-[#ffd700]/10"
                      : "border-gray-200 hover:border-[#1e7e34]"
                  }`}
                >
                  <h3 className="font-bold text-[#1e7e34]">{location.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                  {location.phone && (
                    <p className="text-sm text-gray-600">{location.phone}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Order Type */}
          <Card className="p-6 border-2 border-[#1e7e34]">
            <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Order Type</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="pickup"
                  checked={orderType === "pickup"}
                  onChange={(e) => setOrderType(e.target.value as "pickup" | "delivery")}
                  className="w-4 h-4"
                />
                <span className="font-medium">Pickup</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="delivery"
                  checked={orderType === "delivery"}
                  onChange={(e) => setOrderType(e.target.value as "pickup" | "delivery")}
                  className="w-4 h-4"
                />
                <span className="font-medium">Delivery</span>
              </label>
            </div>
          </Card>

          {/* Pickup Time or Delivery Address */}
          {orderType === "pickup" ? (
            <Card className="p-6 border-2 border-[#1e7e34]">
              <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Pickup Time</h2>
              <input
                type="datetime-local"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </Card>
          ) : (
            <Card className="p-6 border-2 border-[#1e7e34]">
              <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Delivery Address</h2>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </Card>
          )}

          {/* Special Requests */}
          <Card className="p-6 border-2 border-[#1e7e34]">
            <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Special Requests</h2>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests or dietary requirements?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card className="p-6 border-2 border-[#1e7e34] sticky top-4">
            <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.menuItemId} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Subtotal:</span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span className="text-[#ffd700]">${calculateTotal()}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-[#ffd700] hover:bg-[#ffed4e] text-[#1e7e34] font-bold"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full mt-3"
              onClick={() => setLocation("/menu")}
              disabled={isProcessing}
            >
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
