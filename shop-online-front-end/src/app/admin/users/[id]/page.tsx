"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import userIcon from "@/assets/imgs/logo-coolmate-new-mobile-v2.svg";

export default function UserDetailPage() {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState("info");

  // Mock user data - replace with API call in production
  const userData = {
    id: id,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0912345678",
    status: "active",
    statusLabel: "Đang hoạt động",
    statusClass: "bg-success",
    gender: "Nam",
    birthdate: "15/05/1990",
    address: "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    registeredDate: "15/01/2025",
    totalOrders: 5,
    totalSpent: "4.500.000đ",
    lastPurchase: "01/04/2025",
    notes: "Khách hàng VIP, thích sản phẩm cao cấp",
    addresses: [
      {
        id: 1,
        name: "Nhà riêng",
        address: "123 Đường Nguyễn Huệ, Quận 1",
        city: "TP.HCM",
        phone: "0912345678",
        isDefault: true,
      },
      {
        id: 2,
        name: "Văn phòng",
        address: "456 Đường Lê Lợi, Quận 3",
        city: "TP.HCM",
        phone: "0912345678",
        isDefault: false,
      },
    ],
    orders: [
      {
        id: "ORD-0001",
        date: "01/04/2025",
        status: "completed",
        statusLabel: "Hoàn thành",
        statusClass: "bg-success",
        total: "1.500.000đ",
        items: 3,
      },
      {
        id: "ORD-0005",
        date: "15/03/2025",
        status: "completed",
        statusLabel: "Hoàn thành",
        statusClass: "bg-success",
        total: "900.000đ",
        items: 2,
      },
      {
        id: "ORD-0012",
        date: "28/02/2025",
        status: "completed",
        statusLabel: "Hoàn thành",
        statusClass: "bg-success",
        total: "750.000đ",
        items: 1,
      },
      {
        id: "ORD-0018",
        date: "10/02/2025",
        status: "completed",
        statusLabel: "Hoàn thành",
        statusClass: "bg-success",
        total: "1.200.000đ",
        items: 2,
      },
      {
        id: "ORD-0025",
        date: "20/01/2025",
        status: "cancelled",
        statusLabel: "Đã hủy",
        statusClass: "bg-danger",
        total: "650.000đ",
        items: 1,
      },
    ],
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Người dùng", href: "/admin/users" },
    { label: id, active: true },
  ];

  return (
    <AdminLayout title={`Thông tin khách hàng ${id}`}>
      {/* Content Header */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Thông tin khách hàng {id}
              </h1>
            </div>
            <div className="mt-2 sm:mt-0">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="p-4 sm:p-6">
        <div className="container mx-auto">
          <div className="mb-6">
            {/* Action buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
              <Link
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 bg-secondary border border-transparent rounded-md font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
              >
                <i className="fas fa-arrow-left mr-2"></i> Quay lại
              </Link>
              <button
                onClick={() => console.log(`Edit user ${id}`)}
                className="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                <i className="fas fa-edit mr-2"></i> Chỉnh sửa
              </button>
              {userData.status === "active" ? (
                <button className="inline-flex items-center px-4 py-2 bg-danger border border-transparent rounded-md font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition">
                  <i className="fas fa-ban mr-2"></i> Vô hiệu hóa
                </button>
              ) : (
                <button className="inline-flex items-center px-4 py-2 bg-success border border-transparent rounded-md font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition">
                  <i className="fas fa-check-circle mr-2"></i> Kích hoạt
                </button>
              )}
            </div>

            {/* User profile summary */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={userIcon}
                      alt={userData.name}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-center">
                    {userData.name}
                  </h2>
                  <p className="text-gray-600 text-center">{userData.email}</p>
                  <span
                    className={`mt-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${userData.statusClass} text-white`}
                  >
                    {userData.statusLabel}
                  </span>
                </div>
                <div className="md:w-3/4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-gray-500 font-medium mb-2">
                        Thông tin tài khoản
                      </h3>
                      <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500 w-1/3">
                              ID
                            </td>
                            <td className="py-2 text-sm text-gray-900">
                              {userData.id}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">
                              Điện thoại
                            </td>
                            <td className="py-2 text-sm text-gray-900">
                              {userData.phone}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">
                              Ngày đăng ký
                            </td>
                            <td className="py-2 text-sm text-gray-900">
                              {userData.registeredDate}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <h3 className="text-gray-500 font-medium mb-2">
                        Thống kê mua hàng
                      </h3>
                      <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500 w-1/2">
                              Tổng đơn hàng
                            </td>
                            <td className="py-2 text-sm text-gray-900">
                              {userData.totalOrders} đơn
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">
                              Tổng chi tiêu
                            </td>
                            <td className="py-2 text-sm text-gray-900">
                              {userData.totalSpent}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">
                              Mua hàng gần nhất
                            </td>
                            <td className="py-2 text-sm text-gray-900">
                              {userData.lastPurchase}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "info"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("info")}
                  >
                    Thông tin chi tiết
                  </button>
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "orders"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("orders")}
                  >
                    Lịch sử mua hàng
                  </button>
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "addresses"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("addresses")}
                  >
                    Địa chỉ
                  </button>
                  <button
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "notes"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("notes")}
                  >
                    Ghi chú
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* User Info Tab */}
                {activeTab === "info" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Thông tin cá nhân
                      </h3>
                      <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500 w-1/3">
                              Họ tên
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {userData.name}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Email
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {userData.email}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Điện thoại
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {userData.phone}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Giới tính
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {userData.gender}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Ngày sinh
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {userData.birthdate}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Địa chỉ
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {userData.address}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">
                        Thông tin tài khoản
                      </h3>
                      <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500 w-1/3">
                              ID tài khoản
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {userData.id}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Trạng thái
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${userData.statusClass} text-white`}
                              >
                                {userData.statusLabel}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 text-sm font-medium text-gray-500">
                              Ngày đăng ký
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {userData.registeredDate}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Lịch sử đơn hàng
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Mã đơn hàng
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Ngày đặt
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Trạng thái
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Sản phẩm
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Tổng tiền
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userData.orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${order.statusClass} text-white`}
                                >
                                  {order.statusLabel}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.items} sản phẩm
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {order.total}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                  href={`/admin/orders/${order.id}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Xem chi tiết
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Danh sách địa chỉ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userData.addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 ${
                            address.isDefault
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">
                              {address.name}
                              {address.isDefault && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  Mặc định
                                </span>
                              )}
                            </h4>
                          </div>
                          <p className="text-gray-600 mb-1">
                            {address.address}
                          </p>
                          <p className="text-gray-600 mb-1">{address.city}</p>
                          <p className="text-gray-600">
                            Điện thoại: {address.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Ghi chú về khách hàng
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{userData.notes}</p>
                    </div>
                    <div className="mt-4">
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Thêm ghi chú mới
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                        placeholder="Nhập ghi chú về khách hàng này..."
                      ></textarea>
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Lưu ghi chú
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
