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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState<
    {
      id: number;
      userId: string | number;
      status: string;
      statusClass: string;
      total: string;
      date: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [totalUsers, setTotalUsers] = useState(0);

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

        // setPagination để hiển thị cho stat card
        setPagination({
          currentPage: orders.pagination?.currentPage || 1,
          totalPages: orders.pagination?.totalPages || 1,
          totalItems: orders.pagination?.total || 0,
        });

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
              canceled: "bg-danger",
            };
            return statusMap[status] || "bg-secondary";
          };

          // Định dạng ngày
          const formatDate = (dateString: string): string => {
            const date = new Date(dateString);
            return date.toLocaleDateString("vi-VN");
          };
          console.log("Order:", order);

          return {
            id: order.id,
            userId: order.userId || "Unknown",
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
      value: pagination.totalItems,
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
            </>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
