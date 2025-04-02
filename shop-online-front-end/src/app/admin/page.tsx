"use client";
// import Link from "next/link";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import StatCard from "@/components/admin/dashboard/StatCard";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";

export default function AdminDashboardPage() {
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

  // Dữ liệu cho đơn hàng gần đây
  const recentOrders = [
    {
      id: "ORD-0001",
      customer: "Nguyễn Văn A",
      status: "Hoàn thành",
      statusClass: "bg-success",
      total: "1.500.000đ",
      date: "01/04/2025",
    },
    {
      id: "ORD-0002",
      customer: "Trần Thị B",
      status: "Đang xử lý",
      statusClass: "bg-warning",
      total: "2.300.000đ",
      date: "01/04/2025",
    },
    {
      id: "ORD-0003",
      customer: "Lê Văn C",
      status: "Đang giao",
      statusClass: "bg-info",
      total: "950.000đ",
      date: "31/03/2025",
    },
    {
      id: "ORD-0004",
      customer: "Phạm Thị D",
      status: "Đã hủy",
      statusClass: "bg-danger",
      total: "1.200.000đ",
      date: "30/03/2025",
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
