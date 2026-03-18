import React, { createContext, useContext, useState, ReactNode } from "react";

interface Location {
  id: number;
  name: string;
  address: string;
  phone?: string;
}

interface LocationContextType {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
  clearSelectedLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("selectedLocation");
    return saved ? JSON.parse(saved) : null;
  });

  const handleSetSelectedLocation = (location: Location) => {
    setSelectedLocation(location);
    localStorage.setItem("selectedLocation", JSON.stringify(location));
  };

  const handleClearSelectedLocation = () => {
    setSelectedLocation(null);
    localStorage.removeItem("selectedLocation");
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation: handleSetSelectedLocation,
        clearSelectedLocation: handleClearSelectedLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
