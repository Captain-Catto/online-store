"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface DeviceContextType {
  isMiniMobile: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
}

const DeviceContext = createContext<DeviceContextType>({
  isMiniMobile: false,
  isMobile: false,
  isTablet: false,
  isLaptop: true,
  isDesktop: false,
});

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [deviceType, setDeviceType] = useState({
    isMiniMobile: false,
    isMobile: false,
    isTablet: false,
    isLaptop: true,
    isDesktop: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setDeviceType({
        isMiniMobile: width < 576,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 992,
        isLaptop: width >= 992 && width < 1200,
        isDesktop: width >= 1200,
      });
    };

    // Set on mount
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DeviceContext.Provider value={deviceType}>
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevice = () => useContext(DeviceContext);
