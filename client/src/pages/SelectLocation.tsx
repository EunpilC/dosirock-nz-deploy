import { useLocation as useNavigation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "@/contexts/LocationContext";
import { useState } from "react";
import { MapPin, Phone } from "lucide-react";

export default function SelectLocation() {
  const [, navigate] = useNavigation();
  const { setSelectedLocation } = useLocation();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: locations, isLoading } = trpc.location.all.useQuery();

  const handleSelectLocation = (location: any) => {
    setSelectedLocation(location);
    setSelectedId(location.id);
    // Navigate to menu after selection
    setTimeout(() => {
      navigate("/menu");
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="container py-12 text-center">
        <p className="text-gray-600">Loading locations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e7e34] to-[#0d5a1f] py-12">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Select Your Location
          </h1>
          <p className="text-white/80 text-lg">
            Choose a Dosirock location to start your order
          </p>
        </div>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {locations?.map((location) => (
            <div
              key={location.id}
              onClick={() => handleSelectLocation(location)}
              className={`cursor-pointer transition-all transform hover:scale-105 ${
                selectedId === location.id ? "scale-105" : ""
              }`}
            >
              <Card
                className={`p-6 border-3 h-full flex flex-col justify-between ${
                  selectedId === location.id
                    ? "border-[#ffd700] bg-[#ffd700]/10 shadow-lg shadow-[#ffd700]/50"
                    : "border-white/20 bg-white/5 hover:border-white/40"
                }`}
              >
                {/* Location Name */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {location.name}
                  </h2>
                </div>

                {/* Address */}
                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-[#ffd700] flex-shrink-0 mt-1" />
                    <p className="text-white/80 text-sm leading-relaxed">
                      {location.address}
                    </p>
                  </div>

                  {/* Phone */}
                  {location.phone && (
                    <div className="flex gap-3">
                      <Phone className="w-5 h-5 text-[#ffd700] flex-shrink-0 mt-1" />
                      <p className="text-white/80 text-sm">{location.phone}</p>
                    </div>
                  )}
                </div>

                {/* Select Button */}
                <Button
                  size="lg"
                  className={`w-full font-bold transition-all ${
                    selectedId === location.id
                      ? "bg-[#ffd700] hover:bg-[#ffed4e] text-[#1e7e34]"
                      : "bg-white/20 hover:bg-white/30 text-white border border-white/40"
                  }`}
                >
                  {selectedId === location.id ? "✓ Selected" : "Select"}
                </Button>
              </Card>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <Card className="bg-white/10 border border-white/20 p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-3">
            Why Choose Your Location First?
          </h3>
          <p className="text-white/80 max-w-2xl mx-auto">
            Selecting your location ensures accurate delivery times, availability of menu items,
            and proper routing of your order to the right Dosirock kitchen.
          </p>
        </Card>
      </div>
    </div>
  );
}
