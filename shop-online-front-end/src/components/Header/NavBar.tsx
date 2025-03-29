"use client";

import React from "react";
import Link from "next/link";
import { navItems } from "./MenuToggle";

const NavBar: React.FC = () => {
  return (
    <nav className="relative hidden md:flex">
      <ul className="flex gap-6">
        {navItems.map((item) => (
          <li key={item.href} className="relative group">
            <Link
              href={item.href}
              className="text-gray-700 hover:text-black py-2 inline-block"
            >
              {item.label}
              {item.dropdown && (
                <span className="ml-1 inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline"
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
                </span>
              )}
            </Link>

            {/* Dropdown Menu - CSS based hover */}
            {item.dropdown && (
              <div className="absolute left-0 mt-0 w-56 bg-white shadow-lg rounded-md py-2 z-50 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-1">
                {item.dropdown.map((dropdownItem) => (
                  <Link
                    key={dropdownItem.href}
                    href={dropdownItem.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                  >
                    {dropdownItem.label}
                  </Link>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
