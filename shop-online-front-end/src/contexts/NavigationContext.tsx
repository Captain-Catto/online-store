"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import {
  NavigationService,
  NavigationMenuItem,
} from "@/services/NaviagationService";

interface NavigationContextType {
  menuItems: NavigationMenuItem[];
  loading: boolean;
  error: string | null;
  refreshNavigation: () => Promise<void>;
  updateMenuItems: (items: NavigationMenuItem[]) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  menuItems: [],
  loading: true,
  error: null,
  refreshNavigation: async () => {},
  updateMenuItems: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNavigation = async () => {
    try {
      setLoading(true);
      const data = await NavigationService.getPublicMenu();
      setMenuItems(data);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải menu:", err);
      setError("Không thể tải menu navigation");
    } finally {
      setLoading(false);
    }
  };

  // Tải menu khi component được mount
  useEffect(() => {
    loadNavigation();
  }, []);

  // Thay đổi refreshNavigation để clear cache
  const refreshNavigation = async () => {
    try {
      setLoading(true);
      const data = await NavigationService.getPublicMenu();
      setMenuItems(data);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải menu:", err);
      setError("Không thể tải menu navigation");
    } finally {
      setLoading(false);
    }
  };

  // Hàm để cập nhật menu items trực tiếp (sử dụng khi drag & drop)
  const updateMenuItems = (items: NavigationMenuItem[]) => {
    setMenuItems([...items]);
  };

  return (
    <NavigationContext.Provider
      value={{ menuItems, loading, error, refreshNavigation, updateMenuItems }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
