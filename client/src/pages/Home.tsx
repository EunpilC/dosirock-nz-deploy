import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChefHat, Truck, Clock, Star } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32">
        <div className="container flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              신선한 한국 도시락
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8">
              매일 신선한 재료로 정성껏 준비한 도시락을 온라인으로 주문하세요.
              픽업 또는 배달로 편리하게 받아보실 수 있습니다.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-[#ffd700] hover:bg-[#ffed4e] text-[#1e7e34] font-bold"
                onClick={() => setLocation("/menu")}
              >
                메뉴 보기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => setLocation("/contact")}
              >
                문의하기
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
              <div className="text-6xl text-center">🍱</div>
              <p className="text-center mt-4 text-gray-100">
                매일 신선한 한국식 도시락
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#1e7e34]">
            왜 Dosirock을 선택하나요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: ChefHat,
                title: "신선한 재료",
                description: "매일 신선한 재료로 정성껏 준비합니다",
              },
              {
                icon: Truck,
                title: "빠른 배달",
                description: "픽업 또는 배달로 편리하게 받으세요",
              },
              {
                icon: Clock,
                title: "시간 절약",
                description: "온라인 주문으로 시간을 절약하세요",
              },
              {
                icon: Star,
                title: "최고의 맛",
                description: "고객 만족도 최고의 도시락",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <Icon className="w-12 h-12 text-[#1e7e34] mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-[#1e7e34]">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#1e7e34] text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            지금 바로 주문하세요!
          </h2>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
            신선한 한국 도시락을 온라인으로 주문하고 픽업 또는 배달로 받으세요.
          </p>
          <Button
            size="lg"
            className="bg-[#ffd700] hover:bg-[#ffed4e] text-[#1e7e34] font-bold"
            onClick={() => setLocation("/menu")}
          >
            메뉴 보기 및 주문하기
          </Button>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-[#1e7e34]">
                우리의 이야기
              </h3>
              <p className="text-gray-600 mb-4">
                Dosirock은 신선하고 맛있는 한국 도시락을 제공하기 위해 설립되었습니다.
                매일 아침 신선한 재료를 사용하여 정성껏 준비한 도시락을 고객님께 제공합니다.
              </p>
              <p className="text-gray-600">
                우리는 고객님의 만족을 최우선으로 생각하며, 항상 최고의 품질과 서비스를 제공하기 위해 노력합니다.
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🇳🇿</div>
                <p className="text-gray-600 font-semibold">
                  Auckland, New Zealand
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  39 Chancery Street, Auckland CBD
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
