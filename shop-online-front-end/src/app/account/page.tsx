"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

// Giả lập kiểm tra trạng thái đăng nhập
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Trong thực tế, bạn sẽ kiểm tra token hoặc session
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return { isLoggedIn, loading, user };
};

export default function AccountPage() {
  const router = useRouter();
  const { isLoggedIn, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Mock data
  const [orders, setOrders] = useState([
    {
      id: "ORD48759",
      date: "15/03/2025",
      status: "Đã giao hàng",
      total: "1,250,000 VND",
      items: 3,
    },
    {
      id: "ORD37461",
      date: "02/03/2025",
      status: "Đang xử lý",
      total: "890,000 VND",
      items: 2,
    },
  ]);

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Nhà riêng",
      address: "123 Đường Nguyễn Văn A, Phường 1, Quận 1",
      city: "TP HCM",
      phone: "0901234567",
      isDefault: true,
    },
    {
      id: 2,
      name: "Văn phòng",
      address: "456 Đường Lê Lợi, Phường Bến Nghé, Quận 1",
      city: "TP HCM",
      phone: "0909876543",
      isDefault: false,
    },
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

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 min-h-screen">
          <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h1>
            <p className="mb-6">
              Vui lòng đăng nhập để truy cập trang tài khoản của bạn.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.push("/login")}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => router.push("/register")}
                className="border border-black px-6 py-3 rounded-lg hover:bg-gray-100"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">Tài khoản của tôi</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-full">
                  <h2 className="font-bold">{user?.name || "Người dùng"}</h2>
                  <p className="text-sm text-gray-600 break-words max-w-full">
                    {user?.email || "email@example.com"}
                  </p>
                </div>
              </div>

              <nav>
                <ul className="space-y-2">
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded ${
                        activeTab === "profile"
                          ? "bg-black text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveTab("profile")}
                    >
                      Thông tin cá nhân
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded ${
                        activeTab === "orders"
                          ? "bg-black text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveTab("orders")}
                    >
                      Đơn hàng của tôi
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded ${
                        activeTab === "addresses"
                          ? "bg-black text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveTab("addresses")}
                    >
                      Sổ địa chỉ
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded ${
                        activeTab === "settings"
                          ? "bg-black text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveTab("settings")}
                    >
                      Cài đặt tài khoản
                    </button>
                  </li>
                </ul>
              </nav>

              <button
                onClick={handleLogout}
                className="w-full mt-6 px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="w-full md:w-3/4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-bold mb-6 pb-2 border-b">
                    Thông tin cá nhân
                  </h2>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium mb-2"
                        >
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          id="name"
                          defaultValue={user?.name || ""}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium mb-2"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          defaultValue={user?.email || ""}
                          className="w-full px-4 py-2 border rounded-lg"
                          readOnly
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium mb-2"
                        >
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          defaultValue={user?.phone || ""}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="birthday"
                          className="block text-sm font-medium mb-2"
                        >
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          id="birthday"
                          defaultValue={user?.birthday || ""}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-xl font-bold mb-6 pb-2 border-b">
                    Đơn hàng của tôi
                  </h2>

                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex flex-wrap justify-between mb-2">
                            <h3 className="font-medium">
                              Đơn hàng:{" "}
                              <span className="font-bold">{order.id}</span>
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.status === "Đã giao hàng"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "Đang xử lý"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div>Ngày đặt: {order.date}</div>
                            <div>{order.items} sản phẩm</div>
                            <div className="font-medium text-black">
                              {order.total}
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t flex justify-end">
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="text-black underline hover:no-underline"
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        Bạn chưa có đơn hàng nào
                      </p>
                      <Link
                        href="/categories"
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                      >
                        Mua sắm ngay
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div>
                  <div className="flex justify-between items-center mb-6 pb-2 border-b">
                    <h2 className="text-xl font-bold">Sổ địa chỉ</h2>
                    <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                      + Thêm địa chỉ mới
                    </button>
                  </div>

                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="border rounded-lg p-4 relative"
                        >
                          {address.isDefault && (
                            <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Mặc định
                            </span>
                          )}
                          <h3 className="font-bold mb-2">{address.name}</h3>
                          <p className="text-sm text-gray-700 mb-1">
                            {address.address}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            {address.city}
                          </p>
                          <p className="text-sm text-gray-700 mb-4">
                            Điện thoại: {address.phone}
                          </p>
                          <div className="flex gap-2 text-sm">
                            <button className="text-blue-600 hover:underline">
                              Chỉnh sửa
                            </button>
                            {!address.isDefault && (
                              <>
                                <span className="text-gray-300">|</span>
                                <button className="text-gray-600 hover:underline">
                                  Đặt làm mặc định
                                </button>
                                <span className="text-gray-300">|</span>
                                <button className="text-red-600 hover:underline">
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        Bạn chưa có địa chỉ nào
                      </p>
                      <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
                        Thêm địa chỉ
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div>
                  <h2 className="text-xl font-bold mb-6 pb-2 border-b">
                    Cài đặt tài khoản
                  </h2>

                  <div className="space-y-8">
                    <div>
                      <h3 className="font-bold mb-4">Đổi mật khẩu</h3>
                      <form className="space-y-4">
                        <div>
                          <label
                            htmlFor="current-password"
                            className="block text-sm font-medium mb-2"
                          >
                            Mật khẩu hiện tại
                          </label>
                          <input
                            type="password"
                            id="current-password"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="new-password"
                            className="block text-sm font-medium mb-2"
                          >
                            Mật khẩu mới
                          </label>
                          <input
                            type="password"
                            id="new-password"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium mb-2"
                          >
                            Xác nhận mật khẩu mới
                          </label>
                          <input
                            type="password"
                            id="confirm-password"
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                          >
                            Cập nhật mật khẩu
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="pt-6 border-t">
                      <h3 className="font-bold mb-4 text-red-600">
                        Xóa tài khoản
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Khi xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh
                        viễn khỏi hệ thống của chúng tôi. Hành động này không
                        thể hoàn tác.
                      </p>
                      <button className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                        Xóa tài khoản
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
