"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Membership: React.FC = () => {
  const router = useRouter();
  return (
    <div className=" my-8 px-10">
      <div className="container mx-auto rounded-4xl bg-gray-100 px-10 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between ">
          {/* Div 2/3 */}
          <div className="lg:w-2/3 text-center lg:text-left mb-8 lg:mb-0">
            <h4 className="text-2xl font-bold mb-4">
              Trở thành hội viên ngay hôm nay
            </h4>
            <p className="text-lg">
              Đăng ký để nhận thông tin mới nhất từ chúng tôi và nhận ưu đãi đặc
              biệt hàng tháng
            </p>
          </div>
          {/* Div 1/3 */}
          <div className="w-full lg:w-1/3 max-md:pt-4 md:pl-8 2xl:pl-12 max-md:rounded-b-2xl max-md:pb-6">
            <h3 className="text-lg md:text-xl 2xl:text-3xl font-bold mb-3 md:mb-4 text-cm-black-80 text-center">
              THÀNH VIÊN MỚI
            </h3>
            <div
              rel-script="awareness-marquee"
              className="relative rounded-lg bg-transparent pb-4 text-sm md:text-base text-cm-black-80"
            >
              <div className="flex gap-3 overflow-hidden mb-1 md:mb-2">
                <div
                  id="marquee-container-0"
                  className="animate-marquee gap-3 animate-marquee-0"
                  aria-hidden="true"
                >
                  <span className="whitespace-nowrap transaction-item">
                    Phạm Việt Hùng vừa được cộng&nbsp;
                    <strong>29.000đ vào tài khoản</strong>&nbsp; từ ĐH #3xxx922
                  </span>
                  <span className="whitespace-nowrap transaction-item">
                    Minh Nguyen Thi vừa được nhận 1 phần quà sinh nhật đặc biệt.
                  </span>
                  <span className="whitespace-nowrap transaction-item">
                    Chào mừng Tuat Chu Thi vừa gia nhập!
                  </span>
                  <span className="whitespace-nowrap transaction-item">
                    Hiếu Nguyễn vừa được nhận 1 phần quà sinh nhật đặc biệt.
                  </span>
                  <span className="whitespace-nowrap transaction-item">
                    Đào Trọng Nghĩa vừa được cộng&nbsp;
                    <strong>27.000đ vào tài khoản</strong>&nbsp; từ ĐH #6xxx441
                  </span>
                </div>
              </div>
              <div className="flex gap-3 overflow-hidden">
                <div
                  id="marquee-container-1"
                  className="animate-marquee gap-3 animate-marquee-1"
                  aria-hidden="true"
                >
                  <span className="whitespace-nowrap transaction-item">
                    Đào Trọng Nghĩa vừa được cộng&nbsp;
                    <strong>25.000đ vào tài khoản</strong>&nbsp; từ ĐH #3xxx694
                  </span>
                  <span className="whitespace-nowrap transaction-item">
                    ÂN vừa được nhận 1 phần quà sinh nhật đặc biệt.
                  </span>
                  <span className="whitespace-nowrap transaction-item">
                    Chào mừng Long Le vừa gia nhập!
                  </span>
                  <span className="whitespace-nowrap transaction-item">
                    Phạm Việt Hùng vừa được cộng&nbsp;
                    <strong>15.000đ vào tài khoản</strong>&nbsp; từ ĐH #9xxx589
                  </span>
                  <span className="whitespace-nowrap transaction-item">
                    Phúc Nguyễn vừa được nhận 1 phần quà sinh nhật đặc biệt.
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <button
                rel-script="awareness-join-button"
                className="inline-block rounded-full bg-black px-6 py-3 text-white transition-transform cursor-pointer hover:opacity-80"
                onClick={() => router.push("/register")}
              >
                GIA NHẬP NGAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
