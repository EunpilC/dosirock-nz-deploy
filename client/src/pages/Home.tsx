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
              Fresh Korean Lunch Boxes
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8">
              Order delicious Korean lunch boxes prepared fresh daily with quality ingredients.
              Available for pickup or delivery.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-[#ffd700] hover:bg-[#ffed4e] text-[#1e7e34] font-bold"
                onClick={() => setLocation("/menu")}
              >
                View Menu
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => setLocation("/contact")}
              >
                Contact Us
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
              <div className="text-6xl text-center">🍱</div>
              <p className="text-center mt-4 text-gray-100">
                Fresh Korean Lunch Boxes Daily
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#1e7e34]">
            Why Choose Dosirock?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: ChefHat,
                title: "Fresh Ingredients",
                description: "Prepared daily with quality ingredients",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Convenient pickup or delivery options",
              },
              {
                icon: Clock,
                title: "Save Time",
                description: "Order online and save time",
              },
              {
                icon: Star,
                title: "Best Taste",
                description: "Highest customer satisfaction",
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
            Order Now!
          </h2>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
            Order fresh Korean lunch boxes online and enjoy pickup or delivery at your convenience.
          </p>
          <Button
            size="lg"
            className="bg-[#ffd700] hover:bg-[#ffed4e] text-[#1e7e34] font-bold"
            onClick={() => setLocation("/menu")}
          >
            View Menu & Order
          </Button>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-[#1e7e34]">
                Our Story
              </h3>
              <p className="text-gray-600 mb-4">
                Dosirock was established to provide fresh and delicious Korean lunch boxes to the Auckland community.
                We prepare our lunch boxes with care every morning using the finest quality ingredients.
              </p>
              <p className="text-gray-600">
                We prioritize customer satisfaction and are committed to delivering the highest quality products and services.
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
