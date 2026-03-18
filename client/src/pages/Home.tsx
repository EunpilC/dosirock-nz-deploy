import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChefHat, Truck, Clock, Star, ArrowRight } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full">
      {/* Hero Section - Optimized for Conversion */}
      <section className="hero-gradient text-white py-20 md:py-40">
        <div className="container flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-block bg-[#ffd700] text-[#1e7e34] px-4 py-2 rounded-full font-semibold mb-4">
              🍱 Fresh Daily
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Authentic Korean Lunch Boxes
            </h1>
            <p className="text-xl text-gray-100 mb-4">
              Prepared fresh every morning with premium ingredients
            </p>
            <p className="text-lg text-gray-200 mb-8">
              ✓ Pickup or Delivery  ✓ Online Ordering  ✓ Same-Day Service
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-[#ffd700] hover:bg-[#ffed4e] text-[#1e7e34] font-bold text-lg h-14 px-8"
                onClick={() => setLocation("/select-location")}
              >
                Order Now
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg h-14 px-8"
                onClick={() => setLocation("/contact")}
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex-1 hidden md:block">
            <div className="bg-gradient-to-br from-[#ffd700]/20 to-[#1e7e34]/20 rounded-2xl p-12 backdrop-blur-sm border border-white/20">
              <div className="text-7xl text-center mb-4">🍱</div>
              <p className="text-center text-2xl font-bold text-[#ffd700] mb-2">
                Premium Quality
              </p>
              <p className="text-center text-gray-100">
                Authentic Korean flavors in every box
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Menu Preview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1e7e34] mb-4">
              Our Popular Menus
            </h2>
            <p className="text-lg text-gray-600">
              Choose from our carefully curated selection of Korean lunch boxes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                name: "Bibimbap Box",
                price: "$14.99",
                icon: "🥘",
                description: "Mixed rice with vegetables and meat",
              },
              {
                name: "Bulgogi Box",
                price: "$15.99",
                icon: "🍖",
                description: "Marinated beef with rice and sides",
              },
              {
                name: "Kimchi Chicken",
                price: "$13.99",
                icon: "🌶️",
                description: "Spicy chicken with kimchi and rice",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-[#1e7e34] mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#1e7e34]">
                    {item.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button
              size="lg"
              className="bg-[#1e7e34] hover:bg-[#0d5a1f] text-white font-bold text-lg h-14 px-12"
              onClick={() => setLocation("/menu")}
            >
              View Full Menu
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Trust Building */}
      <section className="py-16 md:py-24 bg-[#1e7e34] text-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose Dosirock?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ChefHat,
                title: "Fresh Daily",
                description: "Prepared every morning with premium ingredients",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Convenient pickup or delivery to your location",
              },
              {
                icon: Clock,
                title: "Quick Service",
                description: "Order online and pick up within 30 minutes",
              },
              {
                icon: Star,
                title: "Customer Loved",
                description: "Trusted by hundreds of satisfied customers",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Icon className="w-12 h-12 text-[#ffd700] mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-200 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Ordering Funnel */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center text-[#1e7e34] mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2">
            {[
              {
                step: "1",
                title: "Browse Menu",
                description: "View our delicious Korean lunch boxes",
              },
              {
                step: "2",
                title: "Add to Cart",
                description: "Select your favorite items and quantity",
              },
              {
                step: "3",
                title: "Checkout",
                description: "Choose pickup or delivery option",
              },
              {
                step: "4",
                title: "Enjoy!",
                description: "Receive your fresh meal and enjoy",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-[#1e7e34] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-[#1e7e34] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:flex absolute top-1/3 -right-2 text-[#1e7e34] text-2xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strong CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-[#1e7e34] to-[#0d5a1f] text-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Order?
          </h2>
          <p className="text-xl text-gray-100 mb-4 max-w-2xl mx-auto">
            Get your fresh Korean lunch box delivered or ready for pickup today
          </p>
          <p className="text-lg text-[#ffd700] font-semibold mb-8">
            ⏰ Order by 11 AM for same-day service
          </p>
          <Button
            size="lg"
            className="bg-[#ffd700] hover:bg-[#ffed4e] text-[#1e7e34] font-bold text-lg h-16 px-12"
            onClick={() => setLocation("/menu")}
          >
            Start Ordering Now
            <ArrowRight className="ml-2" size={24} />
          </Button>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-bold text-[#1e7e34] mb-4">
                📍 Location
              </h3>
              <p className="text-gray-600">
                39 Chancery Street<br />
                Auckland CBD<br />
                Auckland 1010, NZ
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1e7e34] mb-4">
                ⏰ Hours
              </h3>
              <p className="text-gray-600">
                Mon-Fri: 11:00 - 20:00<br />
                Sat: 11:00 - 19:00<br />
                Sun: Closed
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1e7e34] mb-4">
                📞 Contact
              </h3>
              <p className="text-gray-600">
                Phone: 09-200-0772<br />
                Email: dosirocknz@gmail.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
