"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { UserLeft } from "@/components/User/User-left";
import { UserRight } from "@/components/User/User-right";
import { useState, useEffect, useCallback } from "react";
import { UserService } from "@/services/UserService";
import { jwtDecode } from "jwt-decode";
import { OrderService } from "@/services/OrderService";
import { useSearchParams } from "next/navigation";

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

// Thêm interface cho JWT payload
interface JwtPayload {
  id: number;
  role: number;
  username: string;
  iat: number;
  exp: number;
}

export default function AccountPage() {
  const router = useRouter();

  // Thay thế useAuth bằng các state và kiểm tra localStorage/sessionStorage
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: number;
    name: string;
    role: number;
  } | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Lấy tab từ URL hoặc mặc định là "account"
    return searchParams.get("tab") || "account";
  });

  // States for user data
  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
  });

  interface Order {
    id: string;
    date: string;
    status: string;
    total: string;
  }

  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [addressesData, setAddressesData] = useState<Address[]>([]);
  interface Promotion {
    id: string;
    title: string;
    expiry: string;
    code: string;
  }

  const [promotionsData, setPromotionsData] = useState<Promotion[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Kiểm tra đăng nhập và lấy thông tin user khi component mount
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
      // Nếu không có token, chuyển hướng về trang login
      router.push("/login?returnUrl=/account");
      return;
    }

    try {
      // Giải mã token để lấy thông tin user
      const tokenData = jwtDecode<JwtPayload>(token);

      // Tạo đối tượng user từ dữ liệu token
      const userData = {
        id: tokenData.id,
        name: tokenData.username, // Username từ token
        role: tokenData.role, // Role từ token
      };

      // Lưu user vào state và localStorage
      setUser(userData);
      setIsAdmin(userData.role === 1);
      setIsLoggedIn(true);

      // Lưu vào localStorage để sử dụng cho các lần sau
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error decoding token:", error);
      // Token không hợp lệ hoặc sai định dạng
      sessionStorage.removeItem("authToken");
      router.push("/login?returnUrl=/account");
      return;
    }

    setLoading(false);
  }, [router]);

  // Hàm gọi API để lấy danh sách địa chỉ
  const fetchAddresses = useCallback(async () => {
    try {
      setDataLoading(true);
      setAddressError(null);

      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      // Chỉ fetch dữ liệu địa chỉ mà không reload toàn bộ trang
      const data = await UserService.getAddresses();

      if (Array.isArray(data)) {
        setAddressesData(data);
      } else {
        console.error("Dữ liệu không phải mảng:", data);
        setAddressError("Dữ liệu địa chỉ không đúng định dạng");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Chi tiết lỗi khi lấy địa chỉ:", error);
        setAddressError(error.message || "Không thể tải địa chỉ");
      } else {
        console.error("Chi tiết lỗi không xác định:", error);
        setAddressError("Không thể tải địa chỉ");
      }
    } finally {
      setDataLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setDataLoading(true);
      setOrderError(null); // Thêm state orderError

      const orders = await OrderService.getMyOrders();

      // Chuyển đổi từ API response sang định dạng đơn hàng hiện tại trong UI
      const formattedOrders = orders.map((order) => ({
        id: order.id.toString(),
        date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
        status: mapOrderStatus(order.status), // Hàm chuyển đổi trạng thái
        total: `${order.total.toLocaleString("vi-VN")} VND`,
      }));

      setOrdersData(formattedOrders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      setOrderError("Không thể tải danh sách đơn hàng");
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Hàm chuyển đổi trạng thái từ API sang tiếng Việt
  const mapOrderStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      processing: "Đang xử lý",
      shipping: "Đang vận chuyển",
      delivered: "Đã giao",
      canceled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return statusMap[status] || status;
  };

  // Fetch user data when component mounts or active tab changes
  useEffect(() => {
    if (isLoggedIn && user) {
      setAccountData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        birthdate: user.birthdate || "",
      });

      // Chỉ tải dữ liệu địa chỉ khi tab là 'addresses' để tối ưu performance
      if (activeTab === "addresses") {
        fetchAddresses();
      }

      if (activeTab === "orders") {
        fetchOrders();
      }

      // Giữ nguyên mock data cho các phần khác
      setOrdersData([
        {
          id: "ORD48759",
          date: "15/04/2025",
          status: "Đã giao",
          total: "1,250,000 VND",
        },
        {
          id: "ORD37461",
          date: "02/04/2025",
          status: "Đang vận chuyển",
          total: "890,000 VND",
        },
      ]);

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
  }, [isLoggedIn, user, activeTab, fetchAddresses, fetchOrders]);

  const handleLogout = () => {
    // Xóa token và user data
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    // Chuyển hướng về trang login
    router.push("/login");
  };

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

  // Nếu không có token, không hiển thị nội dung (đã chuyển hướng ở useEffect)
  if (!isLoggedIn) return null;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Tài khoản của tôi</h1>

          {isAdmin && (
            <Link
              href="/admin"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              Trang quản trị
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <UserLeft
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              // Truyền props cho việc logout
              onLogout={handleLogout}
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
