import React from "react";
import Link from "next/link";

interface UserLeftProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export const UserLeft: React.FC<UserLeftProps> = ({
  activeTab,
  setActiveTab,
}) => {
  console.log("activetab", activeTab);
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <ul className="space-y-2">
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "account"
              ? "bg-black text-white"
              : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("account")}
        >
          Thông tin tài khoản
        </li>
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "orders" ? "bg-black text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Đơn hàng của tôi
        </li>
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "addresses"
              ? "bg-black text-white"
              : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("addresses")}
        >
          Địa chỉ của tôi
        </li>
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "promotions"
              ? "bg-black text-white"
              : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("promotions")}
        >
          Ưu đãi của tôi
        </li>
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "faq" ? "bg-black text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("faq")}
        >
          Chính sách & câu hỏi thường gặp
        </li>
        <li className="p-3 rounded-md cursor-pointer transition-all hover:bg-red-100 hover:text-red-600">
          <Link href="/api/auth/logout">Đăng xuất</Link>
        </li>
      </ul>
    </div>
  );
};
