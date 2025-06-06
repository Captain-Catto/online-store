"use client";

import React, { useEffect, useState } from "react";
import IconNavBar from "./IconNavBar";
import Logo from "./Logo";
import MenuToggle from "./MenuToggle";
// import MegaMenu from "./MegaMenu";
import Navbar from "./NavBar";
import SearchInput from "../Search/SearchInput";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`${
        isScrolled
          ? "fixed top-0 left-0 right-0 bg-white shadow-md"
          : "relative"
      } w-full bg-white z-50`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <MenuToggle />
          </div>

          {/* Logo */}
          <Logo />

          {/* Desktop Navigation with MegaMenu */}
          <div className="hidden md:block">
            {/* <MegaMenu /> */}
            <Navbar />
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <SearchInput
              placeholder="Tìm sản phẩm..."
              showButton={true}
              size="sm"
            />

            {/* User Icons (cart, account, etc) */}
            <IconNavBar />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
