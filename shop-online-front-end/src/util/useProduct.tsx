// hooks/useProducts.ts
import { useEffect, useState } from "react";
import { fetchData } from "../util/fetchData";

// Define or import the Product type
interface Product {
  id: number;
  name: string;
  variants: {
    colors: string[];
    details: {
      [color: string]: {
        images: string[];
      };
    };
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedColors, setSelectedColors] = useState<{
    [productId: number]: string;
  }>({});
  const [productImages, setProductImages] = useState<{
    [productId: number]: string;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchData<Product[]>("/api/products");

        // Xử lý dữ liệu sau khi fetch
        const initialColors: { [productId: number]: string } = {};
        const initialImages: { [productId: number]: string } = {};

        data.forEach((product) => {
          // Thiết lập màu mặc định
          if (product.variants.colors.length > 0) {
            const defaultColor = product.variants.colors[0];
            initialColors[product.id] = defaultColor;

            // Lấy hình ảnh đầu tiên của màu mặc định
            const detail = product.variants.details[defaultColor];
            if (detail && detail.images.length > 0) {
              initialImages[product.id] = detail.images[0];
            }
          }
        });

        setProducts(data);
        setSelectedColors(initialColors);
        setProductImages(initialImages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleColorSelect = (productId: number, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));

    // Cập nhật hình ảnh khi chọn màu mới
    const product = products.find((p) => p.id === productId);
    if (product) {
      const detail = product.variants.details[color];
      if (detail && detail.images.length > 0) {
        setProductImages((prev) => ({
          ...prev,
          [productId]: detail.images[0],
        }));
      }
    }
  };

  return {
    products,
    selectedColors,
    productImages,
    isLoading,
    error,
    handleColorSelect,
  };
}
