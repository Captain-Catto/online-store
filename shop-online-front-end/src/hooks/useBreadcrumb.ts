import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { BreadcrumbItem } from "@/types/breadcrumb";

export const useBreadcrumb = (
  type: "product" | "category" | "page",
  id?: string,
  slug?: string,
  pageTitle?: string
) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: "Trang chủ", href: "/" },
  ]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      setLoading(true);

      try {
        switch (type) {
          case "product":
            if (id) {
              // Lấy thông tin sản phẩm
              const product = await ProductService.getProductById(id);
              const items: BreadcrumbItem[] = [
                { label: "Trang chủ", href: "/" },
              ];

              // Nếu sản phẩm có danh mục
              if (product.categoryId) {
                // Lấy thông tin danh mục
                const category = await CategoryService.getCategoryById(
                  product.categoryId
                );

                // Thêm danh mục cha nếu có
                if (category?.parentId) {
                  const parentCategory = await CategoryService.getCategoryById(
                    category.parentId
                  );
                  if (parentCategory) {
                    items.push({
                      label: parentCategory.name,
                      href: `/category/${parentCategory.slug}`,
                    });
                  }
                }

                // Thêm danh mục hiện tại
                if (category) {
                  items.push({
                    label: category.name,
                    href: `/category/${category.slug}`,
                  });
                }
              }

              // Thêm tên sản phẩm
              items.push({
                label: product.name,
                href: `/products/${product.id}`,
                isLast: true,
              });

              setBreadcrumbs(items);
            }
            break;

          case "category":
            if (slug) {
              const category = await CategoryService.getCategoryBySlug(slug);
              const items: BreadcrumbItem[] = [
                { label: "Trang chủ", href: "/" },
              ];

              if (category?.parentId) {
                // Lấy danh mục cha
                const parentCategory = await CategoryService.getCategoryById(
                  category.parentId
                );
                if (parentCategory) {
                  items.push({
                    label: parentCategory.name,
                    href: `/category/${parentCategory.slug}`,
                  });
                }
              }

              // Thêm danh mục hiện tại
              items.push({
                label: category?.name || slug,
                href: `/category/${slug}`,
                isLast: true,
              });

              setBreadcrumbs(items);
            }
            break;

          case "page":
            if (pageTitle) {
              setBreadcrumbs([
                { label: "Trang chủ", href: "/" },
                { label: pageTitle, href: pathname, isLast: true },
              ]);
            }
            break;
        }
      } catch (error) {
        console.error("Error loading breadcrumbs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreadcrumbs();
  }, [type, id, slug, pathname, pageTitle]);

  return { breadcrumbs, loading };
};
