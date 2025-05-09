"use client";

import React from "react";
import Link from "next/link";
import { LogoIcon } from "./LogoIcon";

const Logo: React.FC = () => {
  return (
    <div>
      <Link href="/" className="hidden md:flex md:items-center py-1">
        <LogoIcon className="h-12 w-12" />
        <span className="ml-2 text-xl font-bold">Shop Online</span>
      </Link>
      <Link href="/" className="md:hidden flex items-center">
        <LogoIcon className="h-10 w-10" />
      </Link>
    </div>
  );
};

export default Logo;
