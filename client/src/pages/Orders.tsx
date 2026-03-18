import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

interface CartItem {
  menuItemId: number;
  name: string;
  price: string;
  quantity: number;
}

export default function Orders() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: locations } = trpc.location.all.useQuery();
  const { data: userOrders } = trpc.order.getUserOrders.useQuery(
    undefined,
    { enabled: !!user }
  );
  const createOrderMutation = trpc.order.create.useMutation();

  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    // Set default location to first one
    if (locations && locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold text-[#1e7e34] mb-6">Order Now</h1>
        <p className="text-gray-600 mb-6">Please log in to place an order.</p>
        <Button
          size="lg"
          className="bg-[#1e7e34] hover:bg-[#0d5a1f]"
          onClick={() => (window.location.href = getLoginUrl())}
        >
          Sign In
        </Button>
      </div>
    );
  }

  const totalPrice = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!selectedLocationId) {
      toast.error("Please select a location");
      return;
    }

    if (orderType === "pickup" && !pickupTime) {
      toast.error("Please select a pickup time");
      return;
    }

    if (orderType === "delivery" && !deliveryAddress) {
      toast.error("Please enter a delivery address");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrderMutation.mutateAsync({
        locationId: selectedLocationId,
        orderType,
        pickupTime: pickupTime ? new Date(pickupTime) : undefined,
        deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
        specialRequests,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          priceAtOrder: item.price,
        })),
        totalAmount: totalPrice.toString(),
      });
      toast.success("Order placed successfully!");
      sessionStorage.removeItem("cart");
      setCart([]);
      setLocation("/");
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-[#1e7e34] mb-8">Order Now</h1>

      {/* Location Selection */}
      <Card className="p-6 mb-8 border-2 border-[#1e7e34]">
        <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Select Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <p className="text-sm text-gray-600 mt-2">{location.address}</p>
              {location.phone && (
                <p className="text-sm text-gray-600">{location.phone}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Order Type Selection */}
      <Card className="p-6 mb-8 border-2 border-[#1e7e34]">
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
        <Card className="p-6 mb-8 border-2 border-[#1e7e34]">
          <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Pickup Time</h2>
          <input
            type="datetime-local"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </Card>
      ) : (
        <Card className="p-6 mb-8 border-2 border-[#1e7e34]">
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
      <Card className="p-6 mb-8 border-2 border-[#1e7e34]">
        <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Special Requests</h2>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Any special requests or dietary requirements?"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          rows={3}
        />
      </Card>

      {/* Cart Summary */}
      <Card className="p-6 mb-8 border-2 border-[#1e7e34]">
        <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Order Summary</h2>
        {cart.length === 0 ? (
          <p className="text-gray-600">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.menuItemId} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-[#ffd700]">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Order History */}
      {userOrders && userOrders.length > 0 && (
        <Card className="p-6 border-2 border-[#1e7e34]">
          <h2 className="text-xl font-bold text-[#1e7e34] mb-4">Your Orders</h2>
          <div className="space-y-4">
            {userOrders.map((order) => (
              <div key={order.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-bold">${order.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Submit Button */}
      <div className="mt-8 flex gap-4">
        <Button
          size="lg"
          className="flex-1 bg-[#1e7e34] hover:bg-[#0d5a1f] text-white"
          onClick={handleSubmitOrder}
          disabled={isSubmitting || cart.length === 0}
        >
          {isSubmitting ? "Processing..." : "Place Order"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={() => setLocation("/menu")}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
