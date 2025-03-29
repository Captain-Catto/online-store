import React from "react";
import Carousel from "./Carousel/Carousel";
import Policy from "./Policy/Policy";
import LatestProducts from "./LatestProducts/LastestProducts";
// import RunningProductsBanner from "./PoloProducts/RunningProducts-Banner";
import Membership from "./Membership/Membership";
import Link from "next/link";

const HomepageContent: React.FC = () => {
  return (
    <div className="">
      <Carousel />
      <Policy />

      <div className="w-full mx-auto space-y-8 mt-8 lg:px-20 md:px-4 px-2">
        <div className="flex justify-between items-flex-start">
          <h2 className="text-2xl font-bold mb-4" id="latest-products">
            Latest Products
          </h2>
          <Link href="/products" className="underline">
            {" "}
            Xem Thêm{" "}
          </Link>
        </div>
        <LatestProducts />
      </div>
      {/* <RunningProductsBanner /> */}
      <div className=" w-full mx-auto space-y-8 mt-8 lg:px-20 md:px-4 sm:px-2">
        <div className="flex justify-between items-flex-start">
          <h2 className="text-2xl font-bold mb-4" id="latest-products">
            Running Products
          </h2>
          <a href="" className="underline">
            Xem Thêm
          </a>
        </div>
        {/* <RunningProducts /> */}
      </div>
      <Membership />
    </div>
  );
};

export default HomepageContent;
