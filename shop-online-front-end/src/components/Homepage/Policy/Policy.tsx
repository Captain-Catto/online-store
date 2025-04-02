"use client";

import React from "react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StoreIcon from "@mui/icons-material/Store";
import CachedIcon from "@mui/icons-material/Cached";
import SecurityIcon from "@mui/icons-material/Security";

const Policy: React.FC = () => {
  const features = [
    {
      icon: <LocalShippingIcon fontSize="medium" />,
      title: "Miễn Phí Vận Chuyển từ 499.000đ",
      subtitle: "tối đa 100.000đ",
      target: "/policy/shipping",
    },
    {
      icon: <StoreIcon fontSize="medium" />,
      title: "Hệ Thống Cửa Hàng",
      subtitle: "Xem danh sách",
      target: "/policy/stores",
    },
    {
      icon: <CachedIcon fontSize="medium" />,
      title: "Đổi Trả Miễn Phí",
      subtitle: "trong 365 ngày",
      target: "/policy/return",
    },
    {
      icon: <SecurityIcon fontSize="medium" />,
      title: "Bảo Hành",
      subtitle: "từ 2 năm",
      target: "/policy/warranty",
    },
  ];

  return (
    <div className="bg-blue-50 p-4">
      {/* Desktop View*/}
      <div className="hidden sm:flex justify-evenly items-start gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex flex-1 flex-col items-center text-center text-sm text-blue-700"
          >
            <div className="flex items-center justify-center bg-white rounded-full p-2 shadow-md">
              {feature.icon}
            </div>
            <a href={feature.target} className="mt-2">
              <h4 className="font-semibold mt-2">{feature.title}</h4>
              <p className="text-xs">{feature.subtitle}</p>
            </a>
          </div>
        ))}
      </div>

      {/* Mobile View*/}
      <div className="sm:hidden overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar snap-x">
          {features.map((feature, index) => (
            <div
              key={index}
              className="min-w-0 shrink-0 grow-0 snap-start basis-[40%] first:ml-4 last:mr-4 px-2"
            >
              <div className="flex flex-col items-center text-center text-sm text-blue-700">
                <div className="flex items-center justify-center bg-white rounded-full p-2 shadow-md">
                  {feature.icon}
                </div>
                <a href="#features" className="mt-2">
                  <h4 className="font-semibold mt-2">{feature.title}</h4>
                  <p className="text-xs">{feature.subtitle}</p>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Policy;
