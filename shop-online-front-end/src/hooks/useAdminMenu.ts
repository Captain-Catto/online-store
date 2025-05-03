import { useState, useEffect, useMemo } from "react";
import { AuthClient } from "@/services/AuthClient";
import { API_BASE_URL } from "@/config/apiConfig";

// Interface MenuItem có thể mở rộng từ interface gốc
export interface MenuItemData {
  id: number;
  title: string;
  path: string;
  icon: string;
  parentId: number | null;
  displayOrder: number;
  children?: MenuItemData[];
}

export interface HierarchicalMenuItem extends MenuItemData {
  children: HierarchicalMenuItem[];
}

export function useAdminMenu() {
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        // Giả sử fetchWithAuth trả về đối tượng Response gốc
        const response = await AuthClient.fetchWithAuth(
          `${API_BASE_URL}/admin-menu`
        );

        // Kiểm tra response có OK không (status code 2xx)
        if (!response.ok) {
          // Ném lỗi với thông tin status nếu có thể
          throw new Error(
            `Failed to fetch admin menu: ${response.status} ${response.statusText}`
          );
        }

        // Phân tích cú pháp body thành JSON
        const jsonData = await response.json();

        // Bây giờ kiểm tra xem jsonData có phải là mảng không
        if (!Array.isArray(jsonData)) {
          console.error("Invalid menu data format received:", jsonData); // Log dữ liệu không hợp lệ
          throw new Error("Invalid menu data received");
        }

        console.log("Admin menu data:", jsonData); // Log dữ liệu JSON đã parse
        setMenuItems(jsonData); // Lưu dữ liệu JSON vào state
        setError(null);
      } catch (err) {
        // Log lỗi cụ thể hơn nếu có thể
        console.error(
          "Failed to fetch admin menu:",
          err instanceof Error ? err.message : err
        );
        setError("Không thể tải menu.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Chuyển đổi cấu trúc phẳng thành cấu trúc cây (hierarchical)
  const hierarchicalMenu = useMemo(() => {
    const itemsById: { [key: number]: HierarchicalMenuItem } = {};
    const rootItems: HierarchicalMenuItem[] = [];

    // Khởi tạo tất cả items với mảng children rỗng
    menuItems.forEach((item) => {
      itemsById[item.id] = { ...item, children: [] };
    });

    // Gắn children vào parent tương ứng
    menuItems.forEach((item) => {
      if (item.parentId && itemsById[item.parentId]) {
        itemsById[item.parentId].children.push(itemsById[item.id]);
        // Sắp xếp children nếu cần
        itemsById[item.parentId].children.sort(
          (a, b) => a.displayOrder - b.displayOrder
        );
      } else if (!item.parentId) {
        rootItems.push(itemsById[item.id]);
      }
    });

    // Sắp xếp root items
    rootItems.sort((a, b) => a.displayOrder - b.displayOrder);
    return rootItems;
  }, [menuItems]);

  return { hierarchicalMenu, loading, error };
}
