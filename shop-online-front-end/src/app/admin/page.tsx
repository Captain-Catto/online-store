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
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { ReportsService } from "@/services/ReportsService";
import { formatCurrency } from "@/utils/currencyUtils";
import { UserService } from "@/services/UserService";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState<
    {
      id: number;
      userId: string | number;
      shippingFullName: string;
      shippingPhoneNumber: string;
      status: string;
      statusClass: string;
      total: string;
      date: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  // Dashboard summary data state
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    topCategory: "",
  });

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push("/login");
    }
  }, [router]);

  // Fetch dữ liệu đơn hàng từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch orders data
        const orders = await OrderService.getAdminOrders();
        console.log("orders", orders);

        // setTotalUsers để hiển thị cho stat card
        setTotalUsers(orders.pagination?.total || 0);

        // Xử lý và định dạng dữ liệu cho component RecentOrdersTable
        const formattedOrders = orders.orders.slice(0, 10).map((order) => {
          // Map trạng thái đơn hàng sang class tương ứng
          const getStatusClass = (status: string): string => {
            const statusMap: Record<string, string> = {
              pending: "bg-secondary",
              processing: "bg-warning",
              shipping: "bg-info",
              delivered: "bg-success",
              cancelled: "bg-danger",
            };
            return statusMap[status] || "bg-secondary";
          };

          // Định dạng ngày
          const formatDate = (dateString: string): string => {
            const date = new Date(dateString);
            return date.toLocaleDateString("vi-VN");
          };

          return {
            id: order.id,
            userId: order.userId || "Unknown",
            shippingFullName: order.shippingFullName || "Unknown User",
            shippingPhoneNumber: order.shippingPhoneNumber || "Chưa rõ",
            status: mapOrderStatus(order.status),
            statusClass: getStatusClass(order.status),
            total: formatCurrency(order.total || 0),
            date: formatDate(order.createdAt),
          };
        });

        setRecentOrders(formattedOrders); // Fetch summary data for dashboard stats
        const summaryResponse = await ReportsService.getSummaryReport();
        setSummaryData({
          totalRevenue: summaryResponse.totalRevenue || 0,
          totalOrders: summaryResponse.totalOrders || 0,
          averageOrderValue: summaryResponse.averageOrderValue || 0,
          totalProducts: summaryResponse.totalProducts || 0,
          lowStockProducts: summaryResponse.lowStockProducts || 0,
          topCategory: summaryResponse.topCategory || "",
        });

        // Lấy tổng số người dùng từ API
        const totalUsersCount = await UserService.getTotalUsers();
        setTotalUsers(totalUsersCount);
      } catch (error) {
        setError(error as string);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Dữ liệu cho các thẻ thống kê
  const statsData = [
    {
      title: "Tổng đơn hàng đã giao tuần này",
      value: summaryData.totalOrders,
      icon: "fas fa-shopping-bag",
      color: "bg-info",
      link: "/admin/orders",
    },
    {
      title: "Doanh thu tuần này",
      value: formatCurrency(summaryData.totalRevenue),
      icon: "fas fa-money-bill-wave",
      color: "bg-success",
      link: "/admin/reports",
    },
    {
      title: "Tổng số người dùng",
      value: totalUsers,
      icon: "fas fa-user-plus",
      color: "bg-warning",
      link: "/admin/users",
    },
    {
      title: "Sản phẩm hết hàng",
      value: summaryData.lowStockProducts,
      icon: "fas fa-exclamation-triangle",
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
          {loading ? (
            // Hiển thị spinner khi đang tải
            <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />
          ) : error ? (
            // Hiển thị thông báo lỗi khi có lỗi
            <div className="alert alert-danger alert-dismissible">
              <button
                type="button"
                className="close"
                data-dismiss="alert"
                aria-hidden="true"
              >
                ×
              </button>
              <h5>
                <i className="icon fas fa-ban"></i> Lỗi!
              </h5>
              {error}
            </div>
          ) : (
            // Hiển thị nội dung khi đã tải xong và không có lỗi
            <>
              {/* Small boxes (Stat box) */}{" "}
              <div className="row">
                {statsData.map((stat, index) => (
                  <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
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
            </>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
