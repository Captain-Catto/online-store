import React from "react";
import Link from "next/link";
import SocialFooter from "./SocialFooter";

const InfoFooter: React.FC = () => {
  return (
    <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
      {/* Thông tin cửa hàng */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Về ShopOnline</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/about" className="hover:text-blue-400">
              Giới thiệu
            </Link>
          </li>
          {/* <li>
            <Link href="/careers" className="hover:text-blue-400">
              Tuyển dụng
            </Link>
          </li> */}
          <li>
            <Link href="/policy/stores" className="hover:text-blue-400">
              Hệ thống cửa hàng
            </Link>
          </li>
          {/* <li>
            <Link href="/news" className="hover:text-blue-400">
              Tin tức & Sự kiện
            </Link>
          </li> */}
          {/* <li>
            <Link href="/sustainability" className="hover:text-blue-400">
              Phát triển bền vững
            </Link>
          </li> */}
        </ul>
      </div>

      {/* Hỗ trợ khách hàng */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Hỗ trợ khách hàng</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/policy" className="hover:text-blue-400">
              Câu hỏi thường gặp
            </Link>
          </li>
          <li>
            <Link href="/policy/shipping" className="hover:text-blue-400">
              Chính sách vận chuyển
            </Link>
          </li>
          <li>
            <Link href="/policy/return" className="hover:text-blue-400">
              Chính sách đổi trả
            </Link>
          </li>
          <li>
            <Link href="/policy/warranty" className="hover:text-blue-400">
              Chính sách bảo hành
            </Link>
          </li>
          <li>
            <Link href="/payment" className="hover:text-blue-400">
              Phương thức thanh toán
            </Link>
          </li>
        </ul>
      </div>

      {/* Liên hệ */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 justify-center md:justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>1800-1234 (Miễn phí)</span>
          </li>
          <li className="flex items-center gap-2 justify-center md:justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>support@shoponline.vn</span>
          </li>
          <li className="flex items-center gap-2 justify-center md:justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>123 Nguyễn Huệ, Quận 1, TP.HCM</span>
          </li>
        </ul>
      </div>

      {/* Mạng xã hội */}
      <div>
        <SocialFooter />
      </div>
    </div>
  );
};

export default InfoFooter;
