import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");

  const { data: allOrders } = trpc.order.all.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const { data: inquiries } = trpc.inquiry.all.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const { data: orderStatuses } = trpc.order.getById.useQuery(
    { id: 1 },
    { enabled: false }
  );

  const updateStatusMutation = trpc.order.updateStatus.useMutation();
  const updateInquiryMutation = trpc.inquiry.updateStatus.useMutation();

  if (user?.role !== "admin") {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold text-[#1e7e34] mb-6">
          접근 권한이 없습니다
        </h1>
        <Button
          onClick={() => setLocation("/")}
          className="bg-[#1e7e34] hover:bg-[#0d5a1f]"
        >
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  const handleUpdateOrderStatus = async (orderId: number, statusId: number) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, statusId });
      toast.success("주문 상태가 업데이트되었습니다");
    } catch (error) {
      toast.error("상태 업데이트 중 오류가 발생했습니다");
    }
  };

  const handleUpdateInquiryStatus = async (
    inquiryId: number,
    status: string
  ) => {
    try {
      await updateInquiryMutation.mutateAsync({ inquiryId, status });
      toast.success("문의 상태가 업데이트되었습니다");
    } catch (error) {
      toast.error("상태 업데이트 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-[#1e7e34] mb-12">관리자 대시보드</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">주문 관리</TabsTrigger>
          <TabsTrigger value="inquiries">문의 관리</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-[#1e7e34] to-[#2d9c4e] text-white">
              <p className="text-sm text-gray-200">총 주문 수</p>
              <p className="text-3xl font-bold">{allOrders?.length || 0}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-[#ffd700] to-[#ffed4e] text-[#1e7e34]">
              <p className="text-sm font-semibold">대기 중</p>
              <p className="text-3xl font-bold">
                {allOrders?.filter((o) => o.orderStatusId === 1).length || 0}
              </p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <p className="text-sm text-gray-200">준비 중</p>
              <p className="text-3xl font-bold">
                {allOrders?.filter((o) => o.orderStatusId === 3).length || 0}
              </p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <p className="text-sm text-gray-200">완료</p>
              <p className="text-3xl font-bold">
                {allOrders?.filter((o) => o.orderStatusId === 5).length || 0}
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-6">
              최근 주문
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#1e7e34]">
                    <th className="text-left py-3 px-4 font-semibold">주문 ID</th>
                    <th className="text-left py-3 px-4 font-semibold">유형</th>
                    <th className="text-left py-3 px-4 font-semibold">금액</th>
                    <th className="text-left py-3 px-4 font-semibold">상태</th>
                    <th className="text-left py-3 px-4 font-semibold">날짜</th>
                    <th className="text-left py-3 px-4 font-semibold">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders?.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">#{order.id}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-200 rounded text-sm">
                          {order.orderType === "pickup" ? "픽업" : "배달"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        ${order.totalAmount}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.orderStatusId}
                          onChange={(e) =>
                            handleUpdateOrderStatus(
                              order.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                        >
                          <option value="1">Pending</option>
                          <option value="2">Confirmed</option>
                          <option value="3">Preparing</option>
                          <option value="4">Ready</option>
                          <option value="5">Completed</option>
                          <option value="6">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          상세보기
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-6">
              고객 문의
            </h2>
            <div className="space-y-4">
              {inquiries?.map((inquiry) => (
                <Card key={inquiry.id} className="p-4 border-l-4 border-[#1e7e34]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{inquiry.subject}</h3>
                      <p className="text-sm text-gray-600">
                        {inquiry.name} ({inquiry.email})
                      </p>
                    </div>
                    <select
                      value={inquiry.status || "new"}
                      onChange={(e) =>
                        handleUpdateInquiryStatus(inquiry.id, e.target.value)
                      }
                      className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1e7e34]"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                  </div>
                  <p className="text-gray-700 mb-3">{inquiry.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
