import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, MapPin, Edit2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation as useLocationContext } from "@/contexts/LocationContext";

interface CartItem {
  menuItemId: number;
  name: string;
  price: string;
  quantity: number;
}

export default function Menu() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { selectedLocation, clearSelectedLocation } = useLocationContext();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Redirect to location selection if no location is selected
  useEffect(() => {
    if (!selectedLocation) {
      setLocation("/select-location");
    }
  }, [selectedLocation, setLocation]);

  const { data: categories } = trpc.menu.categories.useQuery();
  const { data: menuItems } = trpc.menu.itemsByCategory.useQuery(
    { categoryId: selectedCategory || 0 },
    { enabled: selectedCategory !== null }
  );

  useEffect(() => {
    if (categories && categories.length > 0 && selectedCategory === null) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const addToCart = (item: any) => {
    const existingItem = cart.find((ci) => ci.menuItemId === item.id);
    if (existingItem) {
      setCart(
        cart.map((ci) =>
          ci.menuItemId === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (menuItemId: number) => {
    setCart(cart.filter((ci) => ci.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
    } else {
      setCart(
        cart.map((ci) =>
          ci.menuItemId === menuItemId ? { ...ci, quantity } : ci
        )
      );
    }
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!selectedLocation) {
      setLocation("/select-location");
      return;
    }
    // Store cart in sessionStorage and navigate to checkout
    sessionStorage.setItem("cart", JSON.stringify(cart));
    setLocation("/orders");
  };

  return (
    <div className="container py-12">
      {/* Location Header */}
      {selectedLocation && (
        <div className="mb-8 p-4 bg-[#1e7e34]/10 border-2 border-[#1e7e34] rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-[#1e7e34]" />
            <div>
              <p className="text-sm text-gray-600">Ordering from:</p>
              <p className="text-lg font-bold text-[#1e7e34]">{selectedLocation.name}</p>
              <p className="text-sm text-gray-600">{selectedLocation.address}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearSelectedLocation();
              setLocation("/select-location");
            }}
            className="border-[#1e7e34] text-[#1e7e34] hover:bg-[#1e7e34]/10"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Change
          </Button>
        </div>
      )}

      <h1 className="text-4xl font-bold text-[#1e7e34] mb-12">Menu</h1>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Category Tabs */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#1e7e34] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems?.map((item) => (
              <Card
                key={item.id}
                className="food-card overflow-hidden flex flex-col"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-[#1e7e34] mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#1e7e34]">
                      ${item.price}
                    </span>
                      <Button
                      size="sm"
                      className="bg-[#1e7e34] hover:bg-[#0d5a1f]"
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart size={16} className="mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-80 hidden lg:block">
          <Card className="sticky top-20 p-6">
            <h2 className="text-2xl font-bold text-[#1e7e34] mb-4">
              Shopping Cart
            </h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Your cart is empty
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          ${item.price} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.menuItemId, item.quantity - 1)
                          }
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.menuItemId, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                  <div className="border-t pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-[#1e7e34]">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-[#ffd700] hover:bg-[#ffed4e] text-[#1e7e34] font-bold"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Mobile Cart Button */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 lg:hidden">
            <Button
              size="lg"
              className="bg-[#1e7e34] hover:bg-[#0d5a1f] rounded-full w-16 h-16 flex items-center justify-center"
              onClick={() => setShowCart(!showCart)}
            >
              <ShoppingCart size={24} />
              <span className="absolute top-0 right-0 bg-[#ffd700] text-[#1e7e34] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {cart.length}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
