"use client";
import { useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const [orderStatus, setOrderStatus] = useState("processing");

  // Dữ liệu mẫu cho chi tiết đơn hàng
  const orderDetail = {
    id: id,
    orderNumber: id,
    orderDate: "01/04/2025",
    status: "processing",
    statusLabel: "Đang xử lý",
    statusClass: "bg-warning",
    paymentMethod: "COD (Thanh toán khi nhận hàng)",
    paymentStatus: "Chưa thanh toán",
    totalAmount: "2.300.000đ",
    shippingFee: "30.000đ",
    discount: "0đ",
    subTotal: "2.270.000đ",
    notes: "Giao hàng trong giờ hành chính",
    customer: {
      name: "Trần Thị B",
      phone: "0923456789",
      email: "tranthi.b@example.com",
      shippingAddress: "123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh",
    },
    items: [
      {
        id: "PROD-001",
        name: "Áo thun nam basic",
        sku: "AT-NAM-001",
        price: "250.000đ",
        quantity: 2,
        total: "500.000đ",
        image:
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
      },
      {
        id: "PROD-002",
        name: "Quần jean nữ ống đứng",
        sku: "QJ-NU-002",
        price: "550.000đ",
        quantity: 1,
        total: "550.000đ",
        image:
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
      },
      {
        id: "PROD-003",
        name: "Áo khoác dù unisex",
        sku: "AK-UNI-003",
        price: "1.200.000đ",
        quantity: 1,
        total: "1.200.000đ",
        image:
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
      },
    ],
    history: [
      {
        date: "01/04/2025 08:15",
        status: "pending",
        statusLabel: "Chờ xác nhận",
        note: "Đơn hàng đã được tạo.",
      },
      {
        date: "01/04/2025 10:30",
        status: "processing",
        statusLabel: "Đang xử lý",
        note: "Đơn hàng đã được xác nhận.",
      },
    ],
  };

  // Xử lý thay đổi trạng thái đơn hàng
  const handleUpdateStatus = (newStatus: string) => {
    setOrderStatus(newStatus);
    // Thêm code xử lý cập nhật status ở đây (API call)

    // Mô phỏng thêm vào lịch sử
    const statusLabels: { [key: string]: string } = {
      pending: "Chờ xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };

    orderDetail.history.push({
      date: new Date().toLocaleString("vi-VN"),
      status: newStatus,
      statusLabel: statusLabels[newStatus],
      note: `Đơn hàng đã được cập nhật sang ${statusLabels[newStatus]}`,
    });
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Đơn hàng", href: "/admin/orders" },
    { label: id, active: true },
  ];

  // Danh sách trạng thái và màu sắc tương ứng
  const availableStatuses = [
    { value: "pending", label: "Chờ xác nhận", color: "bg-gray-500" },
    { value: "processing", label: "Đang xử lý", color: "bg-yellow-500" },
    { value: "shipping", label: "Đang giao", color: "bg-blue-500" },
    { value: "completed", label: "Hoàn thành", color: "bg-green-500" },
    { value: "cancelled", label: "Đã hủy", color: "bg-red-500" },
  ];

  // Lấy thông tin màu của trạng thái hiện tại
  const getCurrentStatusColor = (status: string) => {
    return (
      availableStatuses.find((s) => s.value === status)?.color || "bg-gray-500"
    );
  };

  return (
    <AdminLayout title={`Chi tiết đơn hàng ${id}`}>
      {/* Content Header */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chi tiết đơn hàng {id}
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
                href="/admin/orders"
                className="inline-flex items-center px-4 py-2 bg-secondary border border-transparent rounded-md font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
              >
                <i className="fas fa-arrow-left mr-2"></i> Quay lại
              </Link>
              <button className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition">
                <i className="fas fa-print mr-2"></i> In hóa đơn
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                <i className="fas fa-envelope mr-2"></i> Gửi email
              </button>
            </div>

            {/* Order summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700">
                    Thông tin đơn hàng
                  </h3>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Mã đơn hàng
                        </th>
                        <td className="py-2 text-gray-800">
                          {orderDetail.orderNumber}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Ngày đặt hàng
                        </th>
                        <td className="py-2 text-gray-800">
                          {orderDetail.orderDate}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Phương thức thanh toán
                        </th>
                        <td className="py-2 text-gray-800">
                          {orderDetail.paymentMethod}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Trạng thái thanh toán
                        </th>
                        <td className="py-2 text-gray-800">
                          {orderDetail.paymentStatus}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Ghi chú
                        </th>
                        <td className="py-2 text-gray-800">
                          {orderDetail.notes || "Không có"}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Trạng thái đơn hàng
                        </th>
                        <td className="py-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full text-white ${getCurrentStatusColor(
                              orderStatus
                            )}`}
                          >
                            {
                              availableStatuses.find(
                                (s) => s.value === orderStatus
                              )?.label
                            }
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700">
                    Thông tin khách hàng
                  </h3>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Tên khách hàng
                        </th>
                        <td className="py-2 text-gray-800">
                          {orderDetail.customer.name}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Số điện thoại
                        </th>
                        <td className="py-2 text-gray-800">
                          {orderDetail.customer.phone}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Email
                        </th>
                        <td className="py-2 text-gray-800">
                          {orderDetail.customer.email}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-left py-2 w-2/5 text-gray-600 font-medium">
                          Địa chỉ giao hàng
                        </th>
                        <td className="py-2 text-gray-800">
                          {orderDetail.customer.shippingAddress}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">
                  Danh sách sản phẩm
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã SKU
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orderDetail.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="48px"
                                className="rounded object-cover"
                              />
                            </div>
                            <span className="text-sm text-gray-800">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {item.sku}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {item.price}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                          {item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <th
                        colSpan={4}
                        className="py-3 px-4 text-right text-sm font-medium text-gray-500"
                      >
                        Tổng tiền sản phẩm:
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-gray-900">
                        {orderDetail.subTotal}
                      </th>
                    </tr>
                    <tr>
                      <th
                        colSpan={4}
                        className="py-3 px-4 text-right text-sm font-medium text-gray-500"
                      >
                        Phí vận chuyển:
                      </th>
                      <td className="py-3 px-4 text-right text-sm text-gray-900">
                        {orderDetail.shippingFee}
                      </td>
                    </tr>
                    <tr>
                      <th
                        colSpan={4}
                        className="py-3 px-4 text-right text-sm font-medium text-gray-500"
                      >
                        Giảm giá:
                      </th>
                      <td className="py-3 px-4 text-right text-sm text-gray-900">
                        {orderDetail.discount}
                      </td>
                    </tr>
                    <tr>
                      <th
                        colSpan={4}
                        className="py-3 px-4 text-right text-base font-semibold text-gray-700"
                      >
                        Tổng thanh toán:
                      </th>
                      <th className="py-3 px-4 text-right text-base font-semibold text-gray-900">
                        {orderDetail.totalAmount}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Update order status */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">
                  Cập nhật trạng thái đơn hàng
                </h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                    >
                      {availableStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                      onClick={() => handleUpdateStatus(orderStatus)}
                    >
                      Cập nhật trạng thái
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order history */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">Lịch sử đơn hàng</h3>
              </div>
              <div className="p-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {orderDetail.history.map((record, index) => (
                      <li key={index}>
                        <div className="relative pb-8">
                          {index !== orderDetail.history.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            ></span>
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getCurrentStatusColor(
                                  record.status
                                )}`}
                              >
                                <i className="fas fa-check text-white text-sm"></i>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-700">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getCurrentStatusColor(
                                      record.status
                                    )} mr-2`}
                                  >
                                    {record.statusLabel}
                                  </span>
                                  {record.note}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {record.date}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
