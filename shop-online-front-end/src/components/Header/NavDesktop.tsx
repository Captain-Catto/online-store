"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SubCategory {
  name: string;
  href: string;
}

interface Category {
  name: string;
  href: string;
  subCategories?: SubCategory[];
}

const categories: Category[] = [
  {
    name: "ÁO NAM",
    href: "/category/1",
    subCategories: [
      { name: "Áo Tanktop", href: "/category/1?subtype=6" },
      { name: "Áo Thun", href: "/category/1?subtype=1" },
      { name: "Áo Thể Thao", href: "/category/1?subtype=7" },
      { name: "Áo Polo", href: "/category/1?subtype=3" },
      { name: "Áo Sơ Mi", href: "/category/1?subtype=5" },
      { name: "Áo Dài Tay", href: "/category/1?subtype=2" },
      { name: "Áo Khoác", href: "/category/1?subtype=4" },
    ],
  },
  {
    name: "QUẦN NAM",
    href: "/category/2",
    subCategories: [
      { name: "Quần Short", href: "/category/2?subtype=12" },
      { name: "Quần Jogger", href: "/category/2?subtype=9" },
      { name: "Quần Thể Thao", href: "/category/2?subtype=11" },
      { name: "Quần Dài", href: "/category/2?subtype=14" },
      { name: "Quần Jean", href: "/category/2?subtype=8" },
      { name: "Quần Bơi", href: "/category/2?subtype=10" },
    ],
  },
  {
    name: "PHỤ KIỆN",
    href: "/category/3",
  },
  {
    name: "GIỚI THIỆU",
    href: "/about",
  },
];

export default function NavDesktop() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <nav className="hidden md:block">
      <ul className="flex space-x-10">
        {categories.map((category) => (
          <li
            key={category.name}
            className="relative group"
            onMouseEnter={() => setHoveredCategory(category.name)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className="flex items-center">
              <Link
                href={category.href}
                className="font-medium text-sm hover:text-blue-500 transition-colors"
              >
                {category.name}
              </Link>
              {category.subCategories && (
                <span className="ml-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>

            {/* Dropdown Menu */}
            {category.subCategories && hoveredCategory === category.name && (
              <div className="absolute left-0 w-48 bg-white shadow-lg mt-2 py-2 z-10 rounded">
                {category.subCategories.map((subCategory) => (
                  <Link
                    key={subCategory.name}
                    href={subCategory.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {subCategory.name}
                  </Link>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
