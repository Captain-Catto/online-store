import React from "react";

interface UserLeftProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export const UserLeft: React.FC<UserLeftProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  // Xử lý khi nhấn vào tab (không cần dùng event)
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName); // Gọi hàm callback được truyền từ AccountLayout
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <ul className="space-y-2">
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "account"
              ? "bg-black text-white"
              : "hover:bg-gray-200"
          }`}
          onClick={() => handleTabClick("account")}
        >
          Thông tin tài khoản
        </li>
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "orders" ? "bg-black text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => handleTabClick("orders")}
        >
          Đơn hàng của tôi
        </li>
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "addresses"
              ? "bg-black text-white"
              : "hover:bg-gray-200"
          }`}
          onClick={() => handleTabClick("addresses")}
        >
          Địa chỉ của tôi
        </li>
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "wishlist"
              ? "bg-black text-white"
              : "hover:bg-gray-200"
          }`}
          onClick={() => handleTabClick("wishlist")}
        >
          Yêu thích
        </li>
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "promotions"
              ? "bg-black text-white"
              : "hover:bg-gray-200"
          }`}
          onClick={() => handleTabClick("promotions")}
        >
          Ưu đãi của tôi
        </li>
        <li
          className={`p-3 rounded-md cursor-pointer transition-all ${
            activeTab === "faq" ? "bg-black text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => handleTabClick("faq")}
        >
          Chính sách & câu hỏi thường gặp
        </li>
        <li
          className="p-3 rounded-md cursor-pointer transition-all hover:bg-red-100 hover:text-red-600"
          onClick={onLogout}
        >
          Đăng xuất
        </li>
      </ul>
    </div>
  );
};
