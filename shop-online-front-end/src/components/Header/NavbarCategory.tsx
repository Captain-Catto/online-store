import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoryService, CategoryNav } from "@/services/CategoryService";
import { useSearch } from "@/hooks/useSearch";
import SearchModal from "@/components/Search/SearchModal";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

export default function NavBarCategory() {
  const [menuItems, setMenuItems] = useState<CategoryNav[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    query,
    setQuery,
    products,
    categories,
    loading: searchLoading,
    isOpen,
    error,
    openSearchModal,
    closeSearchModal,
  } = useSearch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getNavCategories();
        setMenuItems(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  console.log("đang chạy NavBarCategory");
  const renderMenuItem = (category: CategoryNav) => (
    <li key={category.id} className="relative group">
      <Link
        href={`/category/${category.slug}`}
        className="text-sm font-medium hover:text-primary transition-colors pb-2 block"
      >
        {category.name}
      </Link>
      {category.children && category.children.length > 0 && (
        <div className="absolute left-0 top-full z-10 pt-4 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
          <ul className="py-1 bg-white rounded-md shadow-lg">
            {category.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/category/${category.slug}?childCategory=${child.slug}`}
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );

  return (
    <nav className="w-full bg-white">
      <div className="container mx-auto flex items-center justify-between">
        {loading ? (
          <div className="flex justify-center py-3 flex-1">
            <LoadingSpinner size="sm" text="Đang tải menu..." color="black" />
          </div>
        ) : (
          <>
            <ul className="flex space-x-8 justify-center flex-1">
              {menuItems.map(renderMenuItem)}
            </ul>
            <div className="ml-4">
              <button
                onClick={openSearchModal}
                aria-label="Tìm kiếm"
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isOpen}
        onClose={closeSearchModal}
        query={query}
        setQuery={setQuery}
        products={products}
        categories={categories}
        loading={searchLoading}
        error={error}
      />
    </nav>
  );
}
