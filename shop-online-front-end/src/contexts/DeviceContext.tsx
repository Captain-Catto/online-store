"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthClient } from "@/services/AuthClient";

interface DeviceContextType {
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
}

const DeviceContext = createContext<DeviceContextType>({
  isMobile: false,
  isTablet: false,
  isLaptop: true,
  isDesktop: false,
});

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [deviceType, setDeviceType] = useState({
    isMobile: false,
    isTablet: false,
    isLaptop: true,
    isDesktop: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setDeviceType({
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Khởi tạo xác thực...");

        // Thử làm mới token nếu có refresh token trong cookie
        await AuthClient.refreshToken();

        console.log("Khởi tạo xác thực thành công");
      } catch (error) {
        console.error("Lỗi khởi tạo xác thực:", error);
      }
    };

    initAuth();
  }, []);

  return (
    <DeviceContext.Provider value={deviceType}>
      {children}
    </DeviceContext.Provider>
  );
}

export const useDevice = () => useContext(DeviceContext);
