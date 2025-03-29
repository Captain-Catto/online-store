"use client";

import React, { useEffect, useState } from "react";
import IconNavBar from "./IconNavBar";
import Logo from "./Logo";
import NavBar from "./NavBar";
import MenuToggle from "./MenuToggle";

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
      } max-w-screen flex justify-between items-center px-4 z-50`}
    >
      <MenuToggle />
      <Logo />
      <NavBar />
      <IconNavBar />
    </header>
  );
};

export default Header;
