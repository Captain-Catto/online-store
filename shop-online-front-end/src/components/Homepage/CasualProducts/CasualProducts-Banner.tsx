import React from "react";
import poloProductsBanner from "../../../assets/imgs/polo-products-banner.webp";
import Image from "next/image";

const CasualProductsBanner: React.FC = () => {
  return (
    <div className="relative w-full bg-gray-100 mt-4 overflow-hidden relative">
      <div className="absolute top-1/3 left-[50px] text-center text-white z-10 flex flex-col lg:space-y-20 md:space-y-12 sm:space-y-6">
        <span className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold running-products-banner__title">
          ĐỒ THƯỜNG NGÀY
        </span>
        <span className="lg:text-6xl font-semibold running-products-banner__sub-title">
          NEW SEASON
        </span>
      </div>
      <Image
        src={poloProductsBanner}
        alt="Polo Products Banner"
        className="w-full object-fit"
      />
    </div>
  );
};

export default CasualProductsBanner;
