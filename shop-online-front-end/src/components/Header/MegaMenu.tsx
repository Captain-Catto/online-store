"use client";

import React from "react";
import Link from "next/link";

const categories = [
  {
    id: 1,
    name: "ÁO",
    href: "/category/1",
    subCategories: [
      { id: 6, name: "Áo Tanktop", href: "/category/1?subtype=6" },
      { id: 1, name: "Áo Thun", href: "/category/1?subtype=1" },
      { id: 7, name: "Áo Thể Thao", href: "/category/1?subtype=7" },
      { id: 3, name: "Áo Polo", href: "/category/1?subtype=3" },
      { id: 5, name: "Áo Sơ Mi", href: "/category/1?subtype=5" },
      { id: 2, name: "Áo Dài Tay", href: "/category/1?subtype=2" },
      { id: 4, name: "Áo Khoác", href: "/category/1?subtype=4" },
    ],
  },
  {
    id: 2,
    name: "QUẦN",
    href: "/category/2",
    subCategories: [
      { id: 12, name: "Quần Short", href: "/category/2?subtype=12" },
      { id: 9, name: "Quần Jogger", href: "/category/2?subtype=9" },
      { id: 11, name: "Quần Thể Thao", href: "/category/2?subtype=11" },
      { id: 14, name: "Quần Dài", href: "/category/2?subtype=14" },
      { id: 8, name: "Quần Jean", href: "/category/2?subtype=8" },
      { id: 10, name: "Quần Bơi", href: "/category/2?subtype=10" },
    ],
  },
  {
    id: 3,
    name: "CHÍNH SÁCH",
    href: "/policy",
    subCategories: [
      { id: 13, name: "Chính Sách Đổi Trả", href: "/policy/return" },
      { id: 14, name: "Chính Sách Bảo Hành", href: "/policy/warranty" },
      { id: 15, name: "Chính Sách Vận Chuyển", href: "/policy/shipping" },
    ],
  },
  {
    id: 4,
    name: "GIỚI THIỆU",
    href: "/about",
  },
];

export default function MegaMenu() {
  return (
    <nav className="flex space-x-8">
      {categories.map((category) => (
        <div key={category.id} className="relative group">
          <Link
            href={category.href}
            className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors py-2 flex items-center"
          >
            {category.name}
            {category.subCategories && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3 ml-1"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </Link>
          {category.subCategories && (
            <div className="absolute z-50 left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="bg-white shadow-lg rounded-md p-4 min-w-[200px]">
                <div className="flex flex-col space-y-1.5">
                  {category.subCategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      className="text-gray-700 hover:text-blue-600 text-sm py-1"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
