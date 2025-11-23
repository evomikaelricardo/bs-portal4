import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";

export type LocationType = "baltimore" | "pittsburgh" | "pennsylvania";

interface LocationContextType {
  location: LocationType;
  setLocation: (location: LocationType) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within LocationProvider");
  }
  return context;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<LocationType>("baltimore");
  const [urlPath, setUrlPath] = useLocation();

  useEffect(() => {
    const pathParts = urlPath.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const locationFromUrl = pathParts[0].toLowerCase();
      if (locationFromUrl === "baltimore" || locationFromUrl === "pittsburgh" || locationFromUrl === "pennsylvania") {
        setCurrentLocation(locationFromUrl);
      }
    }
  }, [urlPath]);

  const handleSetLocation = (newLocation: LocationType) => {
    setCurrentLocation(newLocation);
    
    const pathParts = urlPath.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const currentLocationInUrl = pathParts[0].toLowerCase();
      if (currentLocationInUrl === "baltimore" || currentLocationInUrl === "pittsburgh" || currentLocationInUrl === "pennsylvania") {
        pathParts[0] = newLocation;
      } else {
        pathParts.unshift(newLocation);
      }
    } else {
      pathParts.unshift(newLocation);
    }
    
    const newPath = "/" + pathParts.join("/");
    setUrlPath(newPath);
  };

  return (
    <LocationContext.Provider value={{ location: currentLocation, setLocation: handleSetLocation }}>
      {children}
    </LocationContext.Provider>
  );
}
