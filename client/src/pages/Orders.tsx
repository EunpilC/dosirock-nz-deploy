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
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [pickupTime, setPickupTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, []);

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold text-[#1e7e34] mb-6">주문하기</h1>
        <p className="text-gray-600 mb-6">주문하려면 먼저 로그인해주세요.</p>
        <Button
          size="lg"
          className="bg-[#1e7e34] hover:bg-[#0d5a1f]"
          onClick={() => (window.location.href = getLoginUrl())}
        >
          로그인하기
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
      toast.error("장바구니가 비어있습니다");
      return;
    }

    if (orderType === "pickup" && !pickupTime) {
      toast.error("픽업 시간을 선택해주세요");
      return;
    }

    if (orderType === "delivery" && !deliveryAddress) {
      toast.error("배달 주소를 입력해주세요");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrderMutation.mutateAsync({
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
      toast.success("주문이 완료되었습니다!");
      sessionStorage.removeItem("cart");
      setCart([]);
      setLocation("/");
    } catch (error) {
      toast.error("주문 처리 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-[#1e7e34] mb-12">주문하기</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-6">
              배송 방식 선택
            </h2>
            <div className="space-y-4">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{borderColor: orderType === "pickup" ? "#1e7e34" : "#e5e7eb"}}>
                <input
                  type="radio"
                  name="orderType"
                  value="pickup"
                  checked={orderType === "pickup"}
                  onChange={(e) => setOrderType(e.target.value as "pickup")}
                  className="mr-4"
                />
                <div>
                  <p className="font-semibold text-[#1e7e34]">픽업</p>
                  <p className="text-sm text-gray-600">매장에서 픽업합니다</p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{borderColor: orderType === "delivery" ? "#1e7e34" : "#e5e7eb"}}>
                <input
                  type="radio"
                  name="orderType"
                  value="delivery"
                  checked={orderType === "delivery"}
                  onChange={(e) => setOrderType(e.target.value as "delivery")}
                  className="mr-4"
                />
                <div>
                  <p className="font-semibold text-[#1e7e34]">배달</p>
                  <p className="text-sm text-gray-600">배달로 받습니다</p>
                </div>
              </label>
            </div>
          </Card>

          {/* Pickup Time or Delivery Address */}
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-6">
              {orderType === "pickup" ? "픽업 시간" : "배달 정보"}
            </h2>
            {orderType === "pickup" ? (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  픽업 시간 선택
                </label>
                <input
                  type="datetime-local"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  배달 주소
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="배달 주소를 입력해주세요"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                />
              </div>
            )}
          </Card>

          {/* Special Requests */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-6">
              특별 요청사항
            </h2>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="특별한 요청사항이 있으면 입력해주세요 (예: 맵기 조절, 추가 요청 등)"
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
            />
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20 p-6">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-6">
              주문 요약
            </h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                장바구니가 비어있습니다
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between text-sm">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">총액:</span>
                    <span className="text-2xl font-bold text-[#1e7e34]">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#1e7e34] hover:bg-[#0d5a1f] text-white font-bold py-2"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "처리 중..." : "주문 완료"}
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Previous Orders */}
      {userOrders && userOrders.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-[#1e7e34] mb-6">
            이전 주문 내역
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">주문 번호</p>
                    <p className="font-semibold">#{order.id}</p>
                  </div>
                  <span className="px-3 py-1 bg-[#1e7e34] text-white rounded-full text-sm">
                    {order.orderType === "pickup" ? "픽업" : "배달"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                </p>
                <p className="text-lg font-bold text-[#1e7e34]">
                  ${order.totalAmount}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
