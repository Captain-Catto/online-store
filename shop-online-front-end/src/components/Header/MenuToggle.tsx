"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNavigation } from "@/contexts/NavigationContext";
import { NavigationMenuItem } from "@/services/NaviagationService";
import logo from "@/assets/imgs/logo-coolmate-new-mobile-v2.svg";
import Image from "next/image";

const MenuToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const { menuItems, loading } = useNavigation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) setExpanded(null);
    document.body.style.overflow = isOpen ? "auto" : "hidden";
  };

  const handleDropdown = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  // Helper: kiểm tra có dropdown không
  const hasDropdown = (item: NavigationMenuItem) =>
    item.children && item.children.length > 0;

  return (
    <>
      <button
        className="md:hidden flex items-center justify-center"
        aria-label="Toggle Menu"
        onClick={toggleMenu}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      {/* Modal Menu */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } bg-black/30`}
        onClick={toggleMenu}
      >
        <div
          className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Menu Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <div style={{ position: "relative", width: 80, height: 40 }}>
              <Image
                src={logo}
                alt="Logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <button
              onClick={toggleMenu}
              className="p-2"
              aria-label="Close Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <ul className="py-2">
            {loading ? (
              <li className="px-4 py-3">Đang tải menu...</li>
            ) : (
              menuItems.map((item) => (
                <li key={item.id} className="border-b border-gray-100">
                  {hasDropdown(item) ? (
                    <>
                      <button
                        className="flex justify-between items-center w-full px-4 py-3 hover:bg-gray-50 font-medium"
                        onClick={() => handleDropdown(item.id)}
                      >
                        <span>{item.name}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 transition-transform duration-200 ${
                            expanded === item.id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <div
                        className={`bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${
                          expanded === item.id ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        {item.children?.map((child) => (
                          <Link
                            key={child.id}
                            href={
                              child.link ||
                              (child.category?.slug
                                ? `/category/${child.category.slug}`
                                : `/category/${child.slug || ""}`)
                            }
                            className="block px-8 py-2 text-gray-600 hover:text-black"
                            onClick={toggleMenu}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={
                        item.link ||
                        (item.category?.slug
                          ? `/category/${item.category.slug}`
                          : `/category/${item.slug || ""}`)
                      }
                      className="block px-4 py-3 hover:bg-gray-50 font-medium"
                      onClick={toggleMenu}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default MenuToggle;
