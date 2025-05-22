"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryService } from "@/services/CategoryService";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { useRouter } from "next/navigation";

// Định nghĩa interface cho danh mục con
interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  image: string | null;
  parentId: number | string | null;
  isActive: boolean;
}

// Định nghĩa interface cho danh mục cha (từ API)
interface CategoryGroup {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  parentId: number | string | null;
  isActive: boolean;
  children: Category[];
}

const Categories: React.FC = () => {
  const router = useRouter();
  // State để lưu danh sách danh mục con
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API để lấy danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response = await CategoryService.getAllCategories();
        const categoryGroups = response as CategoryGroup[];

        // Lấy tất cả danh mục con từ các danh mục cha
        const childCategories = categoryGroups.flatMap(
          (group) => group.children
        );

        setCategories(childCategories);
      } catch {
        setError("Không thể tải danh mục. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto max-w-7xl px-4 mt-10 md:mt-16 mb-6 space-y-4">
      <h2 className="text-3xl font-semibold text-center mb-6">
        Danh mục sản phẩm
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="lg" text="Đang tải danh mục..." />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center my-6">
          <div className="text-red-600 mb-2 text-xl">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* Scrollable Categories */}
          <div className="overflow-hidden">
            <div className="flex overflow-x-auto no-scrollbar snap-x">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="min-w-0 shrink-0 grow-0 snap-start basis-[40%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 px-2 group"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                    <Image
                      src={category.image || "/placeholder-image.jpg"}
                      alt={category.name}
                      width={300}
                      height={400}
                      className="h-full w-full object-cover transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="font-medium text-sm md:text-base mt-2 group-hover:text-blue-600 text-black transition-colors duration-300 text-center uppercase">
                    {category.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Categories;
