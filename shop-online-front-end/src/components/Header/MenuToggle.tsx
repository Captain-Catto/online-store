"use client";

import React, { useState } from "react";
import Link from "next/link";

// Khai báo navItems ở đây để có thể tái sử dụng
export const navItems = [
  { label: "Trang chủ", href: "/" },
  {
    label: "Sản phẩm",
    href: "/categories",
    dropdown: [
      { label: "Đồ mặc hằng ngày", href: "/products/daily" },
      { label: "Đồ mặc ở nhà", href: "/products/home" },
      { label: "Đồ thể thao", href: "/products/sports" },
    ],
  },
  { label: "Giới thiệu", href: "/about" },
  { label: "Chính sách", href: "/policy" },
  { label: "Liên hệ", href: "/contact" },
];

const MenuToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Khi đóng menu, reset các mục đã mở
    if (isOpen) {
      setExpandedItems([]);
    }
    // Vô hiệu hóa cuộn trang khi modal mở
    document.body.style.overflow = isOpen ? "auto" : "hidden";
  };

  const toggleDropdown = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };

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
        className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
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
            <h2 className="text-lg font-semibold">Menu</h2>
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
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            <ul className="py-2">
              {navItems.map((item) => (
                <li key={item.href} className="border-b border-gray-100">
                  {item.dropdown ? (
                    <>
                      <div
                        className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleDropdown(item.href)}
                      >
                        <span className="font-medium">{item.label}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 transition-transform duration-200 ${
                            expandedItems.includes(item.href)
                              ? "rotate-180"
                              : ""
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
                      </div>

                      {/* Dropdown Items */}
                      <div
                        className={`bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedItems.includes(item.href)
                            ? "max-h-96"
                            : "max-h-0"
                        }`}
                      >
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            className="block px-8 py-2 text-gray-600 hover:text-black"
                            onClick={toggleMenu}
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    // menu k dropdown
                    <Link
                      href={item.href}
                      className="block px-4 py-3 hover:bg-gray-50 font-medium"
                      onClick={toggleMenu}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuToggle;
