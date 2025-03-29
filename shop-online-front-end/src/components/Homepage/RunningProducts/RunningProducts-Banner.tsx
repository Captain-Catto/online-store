import React from "react";
import runningProductBanner from "../../../assets/imgs/running-products-banner.webp";
import Image from "next/image";

const RunningProductsBanner: React.FC = () => {
  return (
    <div className="relative w-full  bg-gray-100  mt-4  overflow-hidden relative">
      <div className="absolute top-1/2 left-[50px] text-center text-white z-10 flex flex-col lg:space-y-20 md:space-y-12 sm:space-y-6">
        <span className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold">
          ĐỒ CHẠY BỘ
        </span>
        {/* <span className="lg:text-6xl font-semibold">KHÁM PHÁ NGAY</span> */}
      </div>
      <Image
        src={runningProductBanner}
        alt="Polo Products Banner"
        className="w-full object-fit"
      />
    </div>
  );
};

export default RunningProductsBanner;
