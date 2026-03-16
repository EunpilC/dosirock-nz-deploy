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
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation();
  const createOrderMutation = trpc.order.create.useMutation();

  // Load cart from localStorage
  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다");
      setLocation("/");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("장바구니가 비어있습니다");
      return;
    }

    if (orderType === "delivery" && !deliveryAddress) {
      toast.error("배달 주소를 입력해주세요");
      return;
    }

    if (orderType === "pickup" && !pickupTime) {
      toast.error("픽업 시간을 선택해주세요");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order first
      const totalAmount = calculateTotal();
      const orderResult = await createOrderMutation.mutateAsync({
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
      toast.success("결제 페이지로 이동합니다");
      window.open(checkout.checkoutUrl, "_blank");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("결제 처리 중 오류가 발생했습니다");
    } finally {
      setIsProcessing(false);
    }
  };

  // Load cart on mount
  const [isLoaded, setIsLoaded] = useState(false);
  if (!isLoaded) {
    loadCart();
    setIsLoaded(true);
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-[#1e7e34] mb-8">주문 결제</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type Selection */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-4">
              주문 유형
            </h2>
            <div className="space-y-3">
              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#1e7e34] transition"
                style={{ borderColor: orderType === "pickup" ? "#1e7e34" : undefined }}>
                <input
                  type="radio"
                  value="pickup"
                  checked={orderType === "pickup"}
                  onChange={(e) => setOrderType(e.target.value as "pickup")}
                  className="w-4 h-4"
                />
                <span className="ml-3 font-semibold">픽업</span>
              </label>
              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#1e7e34] transition"
                style={{ borderColor: orderType === "delivery" ? "#1e7e34" : undefined }}>
                <input
                  type="radio"
                  value="delivery"
                  checked={orderType === "delivery"}
                  onChange={(e) => setOrderType(e.target.value as "delivery")}
                  className="w-4 h-4"
                />
                <span className="ml-3 font-semibold">배달</span>
              </label>
            </div>
          </Card>

          {/* Pickup Time or Delivery Address */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-4">
              {orderType === "pickup" ? "픽업 시간" : "배달 주소"}
            </h2>
            {orderType === "pickup" ? (
              <input
                type="datetime-local"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
              />
            ) : (
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="배달 주소를 입력해주세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                rows={3}
              />
            )}
          </Card>

          {/* Special Requests */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-4">
              특별 요청사항
            </h2>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="특별한 요청사항이 있으면 입력해주세요 (선택사항)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
              rows={3}
            />
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-20">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-6">
              주문 요약
            </h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex justify-between items-center pb-3 border-b"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      수량: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t-2 border-[#1e7e34] pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600">소계</p>
                <p>${calculateTotal()}</p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">배달료</p>
                <p>${orderType === "delivery" ? "5.00" : "0.00"}</p>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-[#1e7e34]">
                <p>총액</p>
                <p>
                  $
                  {(
                    parseFloat(calculateTotal()) +
                    (orderType === "delivery" ? 5 : 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={isProcessing || cartItems.length === 0}
              className="w-full bg-[#1e7e34] hover:bg-[#0d5a1f] text-white font-bold py-3 rounded-lg transition"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "결제하기"
              )}
            </Button>

            <Button
              onClick={() => setLocation("/menu")}
              variant="outline"
              className="w-full mt-3"
            >
              계속 쇼핑하기
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
