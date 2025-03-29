"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import imgMobile from "../../assets/imgs/logo-coolmate-new-mobile-v2.svg";

const Logo: React.FC = () => {
  return (
    <div>
      {" "}
      <Link href="/" className="hidden md:flex md:items-center py-1">
        <Image
          src={imgMobile}
          alt="Logo"
          width={50}
          height={50}
          priority
          className="h-auto w-auto"
        />
        <span className="ml-2 text-xl font-bold">Shop Online</span>
      </Link>
      <Link href="/" className="md:hidden flex items-center">
        <Image
          src={imgMobile}
          alt="Logo"
          width={50}
          height={50}
          priority
          className="h-auto w-auto"
        />
      </Link>
    </div>
  );
};

export default Logo;
