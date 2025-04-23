"use client";

import { useState } from "react";
import Link from "next/link";
import { useNavigation } from "@/contexts/NavigationContext";

export default function NavBar() {
  const { menuItems, loading } = useNavigation();
  const [hoverMenuId, setHoverMenuId] = useState<number | null>(null);

  const renderMenuItem = (item: NavigationMenuItem) => {
    const isMegaMenu =
      item.megaMenu && item.children && item.children.length > 0;

    return (
      <li key={item.id} className="relative group">
        <Link
          href={
            item.link ||
            (item.category?.slug
              ? `/category/${item.category.slug}`
              : `/category/${item.slug}`)
          }
          className="block py-2 px-4 hover:text-blue-600 transition-colors"
        >
          {item.name}
          {item.children && item.children.length > 0 && (
            <i className="fas fa-chevron-down ml-1 text-xs"></i>
          )}
        </Link>

        {/* Normal Dropdown - hiển thị bằng CSS hover */}
        {!isMegaMenu && item.children && item.children.length > 0 && (
          <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300">
            <ul>
              {item.children.map((child) => (
                <li key={child.id}>
                  <Link
                    href={{
                      pathname:
                        item.link ||
                        `/category/${item.category?.slug || item.slug}`,
                      query: { childCategory: child.slug },
                    }}
                    className="block py-2 px-4 hover:bg-gray-100"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mega Menu */}
        {isMegaMenu && hoverMenuId === item.id && (
          <div className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-lg z-50 p-6">
            <div className="grid grid-cols-3 gap-8">
              {item.children?.map((child) => (
                <div key={child.id}>
                  <h3 className="text-lg font-medium mb-2">
                    <Link
                      href={
                        child.link ||
                        `/category/${child.category?.slug || child.slug}`
                      }
                    >
                      {child.name}
                    </Link>
                  </h3>
                  {child.children && child.children.length > 0 && (
                    <ul>
                      {child.children.map((grandChild) => (
                        <li key={grandChild.id} className="mb-1">
                          <Link
                            href={{
                              pathname:
                                item.link ||
                                `/category/${item.category?.slug || item.slug}`,
                              query: { childCategory: grandChild.slug },
                            }}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            {grandChild.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </li>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-2">Loading...</div>;
  }

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="container mx-auto">
        <ul className="flex space-x-8 justify-center">
          {menuItems.map(renderMenuItem)}
        </ul>
      </div>
    </nav>
  );
}
