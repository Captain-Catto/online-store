"use client";

import React, { useState, useEffect } from "react";
import { UserLeft } from "./User-left";
import { UserRight } from "./User-right";

// Thêm state cho dữ liệu và loading state
const User: React.FC = () => {
  const [activeTab, setActiveTab] = useState("account");

  // State lưu trữ dữ liệu cho từng tab
  const [accountData, setAccountData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);
  const [addressesData, setAddressesData] = useState(null);
  const [promotionsData, setPromotionsData] = useState(null);

  // State theo dõi trạng thái loading
  const [isLoading, setIsLoading] = useState(false);

  // Kiểm tra URL fragment khi tải trang
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (
      hash &&
      ["account", "orders", "addresses", "promotions", "faq"].includes(hash)
    ) {
      setActiveTab(hash);
    }
  }, []);

  // Cập nhật URL khi tab thay đổi
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // Fetch dữ liệu dựa vào tab đang active
  useEffect(() => {
    const fetchDataForTab = async () => {
      setIsLoading(true);
      try {
        switch (activeTab) {
          case "account":
            if (!accountData) {
              // Fetch dữ liệu tài khoản nếu chưa có
              const response = await fetch("/api/user/account");
              const data = await response.json();
              setAccountData(data);
            }
            break;

          case "orders":
            if (!ordersData) {
              // Fetch dữ liệu đơn hàng nếu chưa có
              const response = await fetch("/api/user/orders");
              const data = await response.json();
              setOrdersData(data);
            }
            break;

          case "addresses":
            if (!addressesData) {
              // Fetch dữ liệu địa chỉ nếu chưa có
              const response = await fetch("/api/user/addresses");
              const data = await response.json();
              setAddressesData(data);
            }
            break;

          case "promotions":
            if (!promotionsData) {
              // Fetch dữ liệu ưu đãi nếu chưa có
              const response = await fetch("/api/user/promotions");
              const data = await response.json();
              setPromotionsData(data);
            }
            break;

          // FAQ không cần fetch dữ liệu vì nó là nội dung tĩnh
        }
      } catch (error) {
        console.error(`Error fetching data for ${activeTab}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataForTab();
  }, [activeTab, accountData, ordersData, addressesData, promotionsData]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Tài khoản của tôi</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <UserLeft activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="md:col-span-3">
          <UserRight
            activeTab={activeTab}
            isLoading={isLoading}
            accountData={accountData}
            ordersData={ordersData}
            addressesData={addressesData}
            promotionsData={promotionsData}
          />
        </div>
      </div>
    </div>
  );
};

export default User;
