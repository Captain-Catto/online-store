"use client";
// import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import StatCard from "@/components/admin/dashboard/StatCard";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";

import { useState, useEffect } from "react";
import { OrderService } from "@/services/OrderService";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";
import { mapOrderStatus } from "@/utils/orderUtils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push("/login");
    }
  }, [router]);

  // Fetch dữ liệu đơn hàng từ API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const orders = await OrderService.getAdminOrders();
        console.log("Orders:", orders);

        // Xử lý và định dạng dữ liệu cho component RecentOrdersTable
        const formattedOrders = orders.items.slice(0, 10).map((order) => {
          // Map trạng thái đơn hàng sang class tương ứng
          const getStatusClass = (status) => {
            const statusMap = {
              pending: "bg-secondary",
              processing: "bg-warning",
              shipping: "bg-info",
              delivered: "bg-success",
              canceled: "bg-danger",
            };
            return statusMap[status] || "bg-secondary";
          };

          // Định dạng ngày
          const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString("vi-VN");
          };

          return {
            id: order.id,
            customer: order.customerName || "Khách hàng",
            status: mapOrderStatus(order.status),
            statusClass: getStatusClass(order.status),
            total: (order.total || 0).toLocaleString("vi-VN") + " VNĐ",
            date: formatDate(order.createdAt),
          };
        });

        setRecentOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Không thể tải dữ liệu đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  // Dữ liệu cho các thẻ thống kê
  const statsData = [
    {
      title: "Đơn hàng mới",
      value: "150",
      icon: "fas fa-shopping-bag",
      color: "bg-info",
      link: "/admin/orders",
    },
    {
      title: "Tăng trưởng",
      value: "53",
      suffix: "%",
      icon: "fas fa-chart-line",
      color: "bg-success",
      link: "#",
    },
    {
      title: "Người dùng đăng ký",
      value: "44",
      icon: "fas fa-user-plus",
      color: "bg-warning",
      link: "/admin/users",
    },
    {
      title: "Sản phẩm mới",
      value: "65",
      icon: "fas fa-tshirt",
      color: "bg-danger",
      link: "/admin/products",
    },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
    { label: "Dashboard", active: true },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Dashboard</h1>
            </div>
            <div className="col-sm-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          {/* Small boxes (Stat box) */}
          <div className="row">
            {statsData.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                icon={stat.icon}
                color={stat.color}
                link={stat.link}
              />
            ))}
          </div>

          {/* Recent Orders */}
          <div className="row">
            <div className="col-md-12">
              <RecentOrdersTable orders={recentOrders} />
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
