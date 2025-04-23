"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CategoryNav, CategoryService } from "@/services/CategoryService";

export default function NavbarCategory() {
  const [categories, setCategories] = useState<CategoryNav[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getNavCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div>Loading categories...</div>;
  }

  console.log("Fetched categories:", categories);

  return (
    <nav className="w-full">
      <ul className="flex flex-wrap items-center gap-8">
        {categories.map((category) => (
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
        ))}
      </ul>
    </nav>
  );
}
