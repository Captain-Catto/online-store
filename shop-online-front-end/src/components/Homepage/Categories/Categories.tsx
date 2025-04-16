"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import aoThun from "../../../assets/imgs/categories/ao-thun-cate_86.webp";
import aoSoMi from "../../../assets/imgs/categories/so-mi-cate_10.webp";
import aoKhoac from "../../../assets/imgs/categories/ao-khoac-cate_16.webp";
import quanDai from "../../../assets/imgs/categories/quan-dai-cate_24.webp";
import quanShort from "../../../assets/imgs/categories/quan-short-cate_36.webp";
import { CategoryGroup } from "@/types/category";

const Categories: React.FC = () => {
  // Dữ liệu danh mục
  const categoryGroups: CategoryGroup[] = [
    {
      id: "nam",
      categories: [
        {
          id: "ao-thun-nam",
          label: "ÁO THUN",
          href: "/category/1?subtype=1",
          image: aoThun,
        },
        {
          id: "ao-so-mi-nam",
          label: "SƠ MI",
          href: "/category/1?subtype=5",
          image: aoSoMi,
        },
        {
          id: "ao-khoac-nam",
          label: "ÁO KHOÁC",
          href: "/category/1?subtype=4",
          image: aoKhoac,
        },
        {
          id: "quan-dai-nam",
          label: "QUẦN DÀI",
          href: "/category/2?subtype=14",
          image: quanDai,
        },
        {
          id: "quan-short-nam",
          label: "QUẦN SHORT",
          href: "/category/2?subtype=12",
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
