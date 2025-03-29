"use client";

import React from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import aoThun from "../../../assets/imgs/categories/ao-thun-cate_86.webp";
import aoSoMi from "../../../assets/imgs/categories/so-mi-cate_10.webp";
import aoKhoac from "../../../assets/imgs/categories/ao-khoac-cate_16.webp";
import quanDai from "../../../assets/imgs/categories/quan-dai-cate_24.webp";
import quanShort from "../../../assets/imgs/categories/quan-short-cate_36.webp";

// Định nghĩa kiểu dữ liệu
interface CategoryItem {
  id: string;
  label: string;
  href: string;
  image: StaticImageData; // StaticImageData type cho local images
}

interface CategoryGroup {
  id: string;
  tabLabel: string;
  categories: CategoryItem[];
}

const Categories: React.FC = () => {
  // Dữ liệu danh mục
  const categoryGroups: CategoryGroup[] = [
    {
      id: "nam",
      tabLabel: "ĐỒ NAM",
      categories: [
        {
          id: "ao-thun-nam",
          label: "ÁO THUN",
          href: "/products/ao-thun-nam",
          image: aoThun,
        },
        {
          id: "ao-so-mi-nam",
          label: "SƠ MI",
          href: "/products/ao-so-mi-nam",
          image: aoSoMi,
        },
        {
          id: "ao-khoac-nam",
          label: "ÁO KHOÁC",
          href: "/products/ao-khoac-nam",
          image: aoKhoac,
        },
        {
          id: "quan-dai-nam",
          label: "QUẦN DÀI",
          href: "/products/quan-dai-nam",
          image: quanDai,
        },
        {
          id: "quan-short-nam",
          label: "QUẦN SHORT",
          href: "/products/quan-short-nam",
          image: quanShort,
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 mt-10 md:mt-16 mb-6 space-y-4">
      {/* Scrollable Categories */}
      <div className="overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar snap-x">
          {categoryGroups.map((group) =>
            group.categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="min-w-0 shrink-0 grow-0 snap-start basis-[40%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 px-2 group"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <Image
                    src={category.image}
                    alt={category.label}
                    placeholder="blur"
                    className="h-full w-full object-cover transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="font-medium text-sm md:text-base mt-2 group-hover:text-blue-600 text-black transition-colors duration-300 text-center uppercase">
                  {category.label}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
