"use client";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { FaTruck, FaExchangeAlt, FaShieldAlt, FaStore } from "react-icons/fa";

export default function PolicyPage() {
  // Danh sách các chính sách
  const policies = [
    {
      id: "shipping",
      title: "Chính Sách Vận Chuyển",
      description:
        "Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ, tối đa 100.000đ",
      icon: <FaTruck className="text-3xl text-blue-600" />,
      link: "/policy/shipping",
      color: "bg-blue-50 border-blue-200 hover:border-blue-300",
    },
    {
      id: "return",
      title: "Chính Sách Đổi Trả",
      description: "Đổi trả miễn phí trong vòng 365 ngày kể từ ngày mua hàng",
      icon: <FaExchangeAlt className="text-3xl text-green-600" />,
      link: "/policy/return",
      color: "bg-green-50 border-green-200 hover:border-green-300",
    },
    {
      id: "warranty",
      title: "Chính Sách Bảo Hành",
      description:
        "Bảo hành sản phẩm từ 30 ngày đến 2 năm tùy theo loại sản phẩm",
      icon: <FaShieldAlt className="text-3xl text-amber-600" />,
      link: "/policy/warranty",
      color: "bg-amber-50 border-amber-200 hover:border-amber-300",
    },
    {
      id: "stores",
      title: "Hệ Thống Cửa Hàng",
      description: "Thông tin về các cửa hàng trên toàn quốc",
      icon: <FaStore className="text-3xl text-purple-600" />,
      link: "/policy/stores",
      color: "bg-purple-50 border-purple-200 hover:border-purple-300",
    },
  ];

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-6 text-sm">
            <Link href="/" className="text-gray-500 hover:text-black">
              Trang chủ
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-black font-medium">Chính sách</span>
          </nav>

          {/* Page Header */}
          <div className="border-b pb-6 mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Chính Sách & Điều Khoản
            </h1>
            <p className="text-gray-600">
              Online Store cam kết mang đến trải nghiệm mua sắm tốt nhất với các
              chính sách rõ ràng và khách hàng là trọng tâm.
            </p>
          </div>

          {/* Policy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {policies.map((policy) => (
              <Link
                key={policy.id}
                href={policy.link}
                className={`block p-6 rounded-lg border-2 ${policy.color} transition duration-200 ease-in-out transform hover:-translate-y-1`}
              >
                <div className="flex items-start">
                  <div className="mr-4">{policy.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{policy.title}</h3>
                    <p className="text-gray-700">{policy.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Cần hỗ trợ thêm?</h2>
            <p className="mb-4">
              Nếu bạn cần thêm thông tin về chính sách hoặc có câu hỏi khác, vui
              lòng liên hệ:
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mt-1 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                <span>
                  Hotline: <strong>1800-XXXX</strong> (8h-22h hàng ngày)
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mt-1 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                <span>
                  Email: <strong>support@shoponline.com</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
