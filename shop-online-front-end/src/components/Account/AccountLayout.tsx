"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { UserLeft } from "@/components/User/User-left";
import { UserRight } from "@/components/User/User-right";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Promotion } from "@/types/promotion";
import { Order } from "@/types/order";
import { AddressPagination } from "@/types/address";
import { WishlistItem } from "@/types/wishlist";
import { UserService } from "@/services/UserService";
import { OrderService } from "@/services/OrderService";
import { WishlistService } from "@/services/WishlistService";
import { VoucherService } from "@/services/VoucherService";
import BreadcrumbTrail from "../Breadcrumb/BreadcrumbTrail";
import { BreadcrumbItem } from "@/types/breadcrumb";
import { useToast } from "@/utils/useToast";

interface AccountLayoutProps {
  defaultActiveTab: string;
}

export default function AccountLayout({
  defaultActiveTab,
}: AccountLayoutProps) {
  const { isLoggedIn, isLoading, logout, isAdmin, isEmployee } =
    useAuth("/login");
  const router = useRouter();
  const pathname = usePathname();

  // Xác định tab hiện tại từ pathname
  const getTabFromPathname = (path: string): string => {
    const segments = path.split("/");
    // Nếu là /account thì trả về 'account', nếu không thì lấy phần tử cuối
    return segments.length <= 2 ? "account" : segments[segments.length - 1];
  };

  const [activeTab, setActiveTab] = useState(
    defaultActiveTab || getTabFromPathname(pathname)
  );
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
  });
  const [ordersData, setOrdersData] = useState<{
    orders: Order[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }>({
    orders: [],
    pagination: {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      perPage: 10,
    },
  });
  const [addressesData, setAddressesData] = useState<AddressPagination[]>([]);
  const [promotionsData, setPromotionsData] = useState<Promotion[]>([]);
  const [wishlistData, setWishlistData] = useState<WishlistItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const [wishlistPagination, setWishlistPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const { showToast, Toast } = useToast();

  // Cập nhật activeTab khi pathname thay đổi
  useEffect(() => {
    const newActiveTab = getTabFromPathname(pathname);
    setActiveTab(newActiveTab);
  }, [pathname]);

  // Xử lý khi chuyển tab - điều hướng đến URL mới
  const handleTabChange = (tab: string) => {
    if (tab === "account") {
      router.push("/account");
    } else {
      router.push(`/account/${tab}`);
    }
  };

  // Cập nhật breadcrumbs khi activeTab thay đổi
  useEffect(() => {
    const baseBreadcrumbs: BreadcrumbItem[] = [
      { label: "Trang chủ", href: "/" },
      { label: "Tài khoản của tôi", href: "/account" },
    ];

    switch (activeTab) {
      case "account":
        setBreadcrumbs(baseBreadcrumbs);
        break;
      case "orders":
        setBreadcrumbs([
          ...baseBreadcrumbs,
          { label: "Đơn hàng của tôi", href: "/account/orders" },
        ]);
        break;
      case "addresses":
        setBreadcrumbs([
          ...baseBreadcrumbs,
          { label: "Địa chỉ của tôi", href: "/account/addresses" },
        ]);
        break;
      case "wishlist":
        setBreadcrumbs([
          ...baseBreadcrumbs,
          { label: "Sản phẩm yêu thích", href: "/account/wishlist" },
        ]);
        break;
      case "promotions":
        setBreadcrumbs([
          ...baseBreadcrumbs,
          { label: "Ưu đãi của tôi", href: "/account/promotions" },
        ]);
        break;
      case "faq":
        setBreadcrumbs([
          ...baseBreadcrumbs,
          { label: "Chính sách & FAQ", href: "/account/faq" },
        ]);
        break;
      default:
        setBreadcrumbs(baseBreadcrumbs);
    }
  }, [activeTab]);

  const fetchAccountInfo = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setDataLoading(true);
      const userProfile = await UserService.getCurrentUser();
      setAccountData({
        name: userProfile.fullName || userProfile.username || "",
        email: userProfile.email || "",
        phone: userProfile.phoneNumber || "",
        birthdate: userProfile.dateOfBirth
          ? new Date(userProfile.dateOfBirth).toLocaleDateString("vi-VN")
          : "",
      });
    } catch (error) {
      showToast(error as string, {
        type: "error",
      });
    } finally {
      setDataLoading(false);
    }
  }, [isLoggedIn, showToast]);

  const fetchAddresses = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setDataLoading(true);
      setAddressError(null);
      const data = await UserService.getAddresses();
      setAddressesData(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(error as string, { type: "error" });
      setAddressError(
        error instanceof Error ? error.message : "Không thể tải địa chỉ"
      );
    } finally {
      setDataLoading(false);
    }
  }, [isLoggedIn, showToast]);

  const fetchOrders = useCallback(
    async (page = 1) => {
      if (!isLoggedIn) return;
      try {
        setDataLoading(true);
        setOrderError(null);
        const response = await OrderService.getMyOrders(page);
        setOrdersData({
          orders: response.orders || [],
          pagination: {
            total: response.pagination?.total || 0,
            totalPages: response.pagination?.totalPages || 1,
            currentPage: page,
            perPage: response.pagination?.perPage || 10,
          },
        });
      } catch (error) {
        setOrderError(
          error instanceof Error ? error.message : "Không thể tải đơn hàng"
        );
      } finally {
        setDataLoading(false);
      }
    },
    [isLoggedIn]
  );

  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setDataLoading(true);
      setWishlistError(null);
      const response = await WishlistService.getWishlist();
      setWishlistData(response.items);
      setWishlistPagination(response.pagination);
    } catch (error) {
      setWishlistError(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách yêu thích"
      );
    } finally {
      setDataLoading(false);
    }
  }, [isLoggedIn]);

  // Hàm lấy danh sách voucher của người dùng
  const fetchUserVouchers = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setDataLoading(true);

      const vouchers = await VoucherService.getUserAvailableVouchers();
      setPromotionsData(vouchers);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách ưu đãi",
        { type: "error" }
      );
    } finally {
      setDataLoading(false);
    }
  }, [isLoggedIn, showToast]);

  // Handle order page change
  const handleOrderPageChange = (page: number) => {
    fetchOrders(page);
  };
  // Load data dựa trên active tab
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      if (activeTab === "addresses") {
        fetchAddresses();
      } else if (activeTab === "orders") {
        fetchOrders();
      } else if (activeTab === "account") {
        fetchAccountInfo();
      } else if (activeTab === "wishlist") {
        fetchWishlist();
      } else if (activeTab === "promotions") {
        fetchUserVouchers();
      }
    }
  }, [
    isLoggedIn,
    isLoading,
    activeTab,
    fetchAccountInfo,
    fetchAddresses,
    fetchOrders,
    fetchWishlist,
    fetchUserVouchers,
  ]);

  // Nếu không đăng nhập, không hiển thị nội dung
  if (!isLoggedIn) return null;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <BreadcrumbTrail items={breadcrumbs} />

        <div className="flex gap-4 items-center mb-8">
          <h1 className="text-3xl font-bold">Tài khoản của tôi</h1>
          {/* Hiển thị link quản trị dựa vào role */}
          {(isAdmin || isEmployee) && (
            <Link
              href={isAdmin ? "/admin" : "/admin/users"}
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
              {isAdmin ? "Quản trị viên" : "Nhân viên"}
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <UserLeft
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              onLogout={logout}
            />
          </div>

          <div className="md:w-3/4">
            <UserRight
              activeTab={activeTab}
              isLoading={dataLoading || isLoading}
              hasError={!!addressError || !!orderError || !!wishlistError}
              errorMessage={addressError || orderError || wishlistError || ""}
              accountData={accountData}
              ordersData={ordersData}
              addressesData={addressesData}
              promotionsData={promotionsData}
              wishlistData={wishlistData}
              wishlistPagination={wishlistPagination}
              onRetryFetch={
                activeTab === "addresses"
                  ? fetchAddresses
                  : activeTab === "orders"
                  ? fetchOrders
                  : activeTab === "account"
                  ? fetchAccountInfo
                  : activeTab === "wishlist"
                  ? fetchWishlist
                  : activeTab === "promotions"
                  ? fetchUserVouchers
                  : undefined
              }
              onPageChange={
                activeTab === "orders" ? handleOrderPageChange : undefined
              }
            />
          </div>
        </div>
      </main>
      {Toast}
      <Footer />
    </>
  );
}
