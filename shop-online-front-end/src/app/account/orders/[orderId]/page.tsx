"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

// Dữ liệu mẫu đơn hàng - trong thực tế sẽ được lấy từ API
const mockOrderData = {
  ORD48759: {
    id: "ORD48759",
    date: "15/03/2025",
    status: "Đã giao hàng",
    statusCode: "delivered",
    total: "1,250,000",
    subtotal: "1,200,000",
    shipping: "50,000",
    discount: "0",
    paymentMethod: "COD - Thanh toán khi nhận hàng",
    shippingInfo: {
      name: "Nguyễn Văn A",
      phone: "0901234567",
      address: "123 Đường Nguyễn Văn A, Phường 1, Quận 1, TP HCM",
    },
    items: [
      {
        id: "SP001",
        name: "Áo Thun Nam Basic",
        color: "Đen",
        size: "L",
        price: "350,000",
        quantity: 2,
        image: "/images/product1.jpg",
      },
      {
        id: "SP002",
        name: "Quần Jeans Nam Slim Fit",
        color: "Xanh Đậm",
        size: "32",
        price: "500,000",
        quantity: 1,
        image: "/images/product1.jpg",
      },
    ],
  },
  ORD37461: {
    id: "ORD37461",
    date: "02/03/2025",
    status: "Đang xử lý",
    statusCode: "processing",
    total: "890,000",
    subtotal: "840,000",
    shipping: "50,000",
    discount: "0",
    paymentMethod: "Chuyển khoản ngân hàng",
    shippingInfo: {
      name: "Trần Thị B",
      phone: "0909876543",
      address: "456 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP HCM",
    },
    items: [
      {
        id: "SP003",
        name: "Áo Sơ Mi Nữ Dài Tay",
        color: "Trắng",
        size: "M",
        price: "420,000",
        quantity: 1,
        image: "/images/product1.jpg",
      },
      {
        id: "SP004",
        name: "Váy Liền Thân Dáng Xòe",
        color: "Hồng Pastel",
        size: "S",
        price: "420,000",
        quantity: 1,
        image: "/images/product1.jpg",
      },
    ],
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  interface Order {
    id: string;
    date: string;
    status: string;
    statusCode: string;
    total: string;
    subtotal: string;
    shipping: string;
    discount: string;
    paymentMethod: string;
    shippingInfo: {
      name: string;
      phone: string;
      address: string;
    };
    items: {
      id: string;
      name: string;
      color: string;
      size: string;
      price: string;
      quantity: number;
      image: string;
    }[];
  }

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Giả lập việc gọi API
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);

        // Giả lập delay network
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Kiểm tra nếu có đơn hàng tương ứng trong dữ liệu mẫu
        if (mockOrderData[orderId as keyof typeof mockOrderData]) {
          setOrder(mockOrderData[orderId as keyof typeof mockOrderData]);
        } else {
          setError("Không tìm thấy thông tin đơn hàng");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError("Đã xảy ra lỗi khi tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Hiển thị thông báo lỗi
  if (error || !order) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
              <Link
                href="/account"
                className="text-gray-600 hover:underline mr-2"
              >
                Tài khoản
              </Link>
              <span className="text-gray-400 mx-2">/</span>
              <Link
                href="/account?tab=orders"
                className="text-gray-600 hover:underline mr-2"
              >
                Đơn hàng
              </Link>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-800">{orderId}</span>
            </div>

            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-red-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {error || "Không tìm thấy đơn hàng"}
              </h2>
              <p className="text-gray-600 mb-6">
                Vui lòng kiểm tra lại mã đơn hàng hoặc quay lại trang danh sách
                đơn hàng
              </p>
              <button
                onClick={() => router.push("/account?tab=orders")}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              >
                Quay lại danh sách đơn hàng
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Xác định lớp và text cho trạng thái đơn hàng
  const getStatusClass = (statusCode: string) => {
    switch (statusCode) {
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipping":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const messengerUsername = "blakesinclair1995";

  const handleClickContact = () => {
    window.open(`https://m.me/${messengerUsername}`, "_blank");
    // _blank để mở tab mới
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center mb-6">
            <Link
              href="/account"
              className="text-gray-600 hover:underline mr-2"
            >
              Tài khoản
            </Link>
            <span className="text-gray-400 mx-2">/</span>
            <Link
              href="/account?tab=orders"
              className="text-gray-600 hover:underline mr-2"
            >
              Đơn hàng
            </Link>
            <span className="text-gray-400 mx-2">/</span>
            <span className="text-gray-800">{order.id}</span>
          </div>

          {/* Order header */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Chi tiết đơn hàng #{order.id}
                </h1>
                <p className="text-gray-600">Ngày đặt: {order.date}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span
                  className={`px-4 py-2 rounded-full ${getStatusClass(
                    order.statusCode
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h2 className="font-semibold mb-2">Trạng thái đơn hàng</h2>
              <div className="relative">
                <div className="flex justify-between mb-2">
                  <div className="text-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                        order.statusCode !== "cancelled"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <p className="text-xs">Đặt hàng</p>
                  </div>
                  <div className="text-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                        order.statusCode !== "processing" &&
                        order.statusCode !== "cancelled"
                          ? "bg-green-500"
                          : order.statusCode === "processing"
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <p className="text-xs">Xác nhận</p>
                  </div>
                  <div className="text-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                        order.statusCode === "shipping"
                          ? "bg-yellow-500"
                          : order.statusCode === "delivered"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <p className="text-xs">Vận chuyển</p>
                  </div>
                  <div className="text-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                        order.statusCode === "delivered"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <p className="text-xs">Giao hàng</p>
                  </div>
                </div>
                <div className="absolute top-3 left-0 right-0 h-1 bg-gray-200 -z-10">
                  <div
                    className={`h-full bg-green-500 ${
                      order.statusCode === "processing"
                        ? "w-1/4"
                        : order.statusCode === "shipping"
                        ? "w-2/3"
                        : order.statusCode === "delivered"
                        ? "w-full"
                        : "w-0"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Shipping info */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="font-bold text-lg mb-4 pb-2 border-b">
                Thông tin giao hàng
              </h2>
              <p className="font-medium">{order.shippingInfo.name}</p>
              <p className="text-gray-600 mb-2">{order.shippingInfo.phone}</p>
              <p className="text-gray-600">{order.shippingInfo.address}</p>
            </div>

            {/* Payment info */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="font-bold text-lg mb-4 pb-2 border-b">
                Phương thức thanh toán
              </h2>
              <p className="text-gray-600">{order.paymentMethod}</p>
            </div>

            {/* Order summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="font-bold text-lg mb-4 pb-2 border-b">
                Tổng thanh toán
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span>{order.subtotal} VND</span>
                </div>
                {Number(order.discount.replace(/,/g, "")) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span>-{order.discount} VND</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span>{order.shipping} VND</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>Tổng cộng:</span>
                  <span>{order.total} VND</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="font-bold text-lg mb-4 pb-2 border-b">
              Sản phẩm đã đặt
            </h2>

            <div className="divide-y">
              {order.items.map((item: Order["items"][number]) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}`}
                  className="py-4 flex items-center"
                >
                  <div className="w-20 h-20 rounded overflow-hidden bg-gray-100 mr-4">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Size: {item.size}, Màu: {item.color}
                    </p>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm">
                        {item.price} VND x {item.quantity}
                      </p>
                      <p className="font-medium">
                        {parseInt(item.price.replace(/,/g, "")) * item.quantity}{" "}
                        VND
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => router.push("/account?tab=orders")}
              className="border border-black text-black px-4 py-2 rounded hover:bg-gray-100"
            >
              Quay lại
            </button>

            {(order.statusCode === "processing" ||
              order.statusCode === "confirmed") && (
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Hủy đơn hàng
              </button>
            )}

            <button
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              onClick={handleClickContact}
            >
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
