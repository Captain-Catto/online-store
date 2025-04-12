"use client";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { UserLeft } from "@/components/User/User-left";
import { UserRight } from "@/components/User/User-right";
import { useState, useEffect, useCallback } from "react";
import { UserService } from "@/services/UserService";
import { OrderService } from "@/services/OrderService";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/utils/useAuth";
import Link from "next/link";

// Interface địa chỉ dựa trên API response
interface Address {
  id: number;
  userId: number;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Thêm vào phần interface ở đầu file
interface AccountData {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
}

// Thay đổi khai báo state

export default function AccountPage() {
  const searchParams = useSearchParams();
  const { isLoggedIn, loading, logout, isAdmin } = useAuth("/login");

  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "account";
  });

  // States for user data
  const [accountData, setAccountData] = useState<AccountData>({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "",
    address: "",
  });

  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [addressesData, setAddressesData] = useState<Address[]>([]);
  const [promotionsData, setPromotionsData] = useState<Promotion[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Hàm fetch user account data
  const fetchAccountInfo = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setDataLoading(true);
      const userProfile = await UserService.getCurrentUser();

      console.log("userProfile", userProfile);

      setAccountData({
        name: userProfile.fullName || userProfile.username || "",
        email: userProfile.email || "",
        phone: userProfile.phoneNumber || "",
        birthdate: userProfile.dateOfBirth
          ? new Date(userProfile.dateOfBirth).toLocaleDateString("vi-VN")
          : "",
        gender: userProfile.gender || "",
        address: "",
      });
    } catch (error) {
      console.error("Error fetching account info:", error);
    } finally {
      setDataLoading(false);
    }
  }, [isLoggedIn]);

  // Hàm gọi API để lấy danh sách địa chỉ
  const fetchAddresses = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setDataLoading(true);
      setAddressError(null);

      const data = await UserService.getAddresses();
      setAddressesData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddressError(
        error instanceof Error ? error.message : "Không thể tải địa chỉ"
      );
    } finally {
      setDataLoading(false);
    }
  }, [isLoggedIn]);

  // Hàm gọi API để lấy danh sách đơn hàng
  const fetchOrders = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setDataLoading(true);
      setOrderError(null);

      const orders = await OrderService.getMyOrders();
      setOrdersData(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrderError(
        error instanceof Error ? error.message : "Không thể tải đơn hàng"
      );
    } finally {
      setDataLoading(false);
    }
  }, [isLoggedIn]);

  // Load data based on active tab
  useEffect(() => {
    if (isLoggedIn && !loading) {
      if (activeTab === "addresses") {
        fetchAddresses();
      } else if (activeTab === "orders") {
        fetchOrders();
      } else if (activeTab === "account") {
        fetchAccountInfo();
      }

      // Sample promotions data
      setPromotionsData([
        {
          id: "PROMO1",
          title: "Giảm 25% cho đơn hàng đầu tiên",
          expiry: "30/04/2025",
          code: "WELCOME25",
        },
        {
          id: "PROMO2",
          title: "Miễn phí vận chuyển",
          expiry: "15/05/2025",
          code: "FREESHIP",
        },
      ]);
    }
  }, [
    isLoggedIn,
    loading,
    activeTab,
    fetchAddresses,
    fetchOrders,
    fetchAccountInfo,
  ]);

  // Nếu đang loading, hiển thị spinner
  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 min-h-screen">
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Nếu không đăng nhập, không hiển thị nội dung
  if (!isLoggedIn) return null;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="flex gap-4 items-center mb-8">
          <h1 className="text-3xl font-bold">Tài khoản của tôi</h1>
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.34-.035-.671-.1-.996A5.001 5.001 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
              Quản trị viên
            </Link>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <UserLeft
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={logout} // Use the logout function from useAuth
            />
          </div>

          <div className="md:w-3/4">
            <UserRight
              activeTab={activeTab}
              isLoading={dataLoading}
              hasError={!!addressError || !!orderError}
              errorMessage={addressError || orderError || ""}
              accountData={accountData}
              ordersData={ordersData}
              addressesData={addressesData}
              promotionsData={promotionsData}
              onRetryFetch={
                activeTab === "addresses"
                  ? fetchAddresses
                  : activeTab === "orders"
                  ? fetchOrders
                  : activeTab === "account"
                  ? fetchAccountInfo
                  : undefined
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
