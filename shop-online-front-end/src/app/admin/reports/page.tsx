"use client";

import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import Link from "next/link";
import { formatCurrency } from "@/utils/currencyUtils";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("week");
  const [reportType, setReportType] = useState("revenue");
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Add new states for order analysis time periods
  const [orderTimeRange, setOrderTimeRange] = useState("week");
  const [orderTimeLabel, setOrderTimeLabel] = useState({
    current: "7 ngày gần nhất (26/03 - 02/04/2025)",
    previous: "kỳ trước (19/03 - 25/03/2025)",
  });

  // Chart refs
  const mainChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const productPerformanceChartRef = useRef(null);

  // Summary data
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    topCategory: "",
  });

  // Mock data for reports
  const revenueData = {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [
      {
        label: "Doanh thu (triệu VNĐ)",
        data: [12, 19, 15, 17, 22, 30, 25],
        backgroundColor: "rgba(60, 141, 188, 0.2)",
        borderColor: "rgba(60, 141, 188, 1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
      {
        label: "Đơn hàng",
        data: [15, 25, 20, 30, 35, 45, 40],
        backgroundColor: "rgba(210, 214, 222, 0.2)",
        borderColor: "rgba(210, 214, 222, 1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const categoryData = {
    labels: ["Áo thun", "Áo sơ mi", "Quần jean", "Váy", "Phụ kiện"],
    datasets: [
      {
        label: "Doanh số theo danh mục (triệu VNĐ)",
        data: [35, 25, 22, 18, 15],
        backgroundColor: [
          "#f56954",
          "#00a65a",
          "#f39c12",
          "#00c0ef",
          "#3c8dbc",
        ],
        borderWidth: 1,
      },
    ],
  };

  const productPerformanceData = {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [
      {
        label: "Áo thun nam cotton",
        data: [5, 7, 6, 8, 10, 12, 9],
        borderColor: "#f56954",
        backgroundColor: "rgba(245, 105, 84, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Quần jean nam slim fit",
        data: [4, 6, 5, 7, 6, 8, 7],
        borderColor: "#00a65a",
        backgroundColor: "rgba(0, 166, 90, 0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Áo sơ mi nữ",
        data: [3, 5, 4, 4, 7, 6, 5],
        borderColor: "#f39c12",
        backgroundColor: "rgba(243, 156, 18, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Top selling products data
  const topProducts = [
    {
      id: "SP001",
      name: "Áo thun nam cotton",
      category: "Áo thun",
      sales: 145,
      revenue: 21750000,
      stock: 50,
    },
    {
      id: "SP002",
      name: "Quần jean nam slim fit",
      category: "Quần jean",
      sales: 120,
      revenue: 24000000,
      stock: 35,
    },
    {
      id: "SP003",
      name: "Áo sơ mi nữ",
      category: "Áo sơ mi",
      sales: 98,
      revenue: 14700000,
      stock: 42,
    },
    {
      id: "SP004",
      name: "Váy liền thân",
      category: "Váy",
      sales: 87,
      revenue: 13050000,
      stock: 28,
    },
    {
      id: "SP005",
      name: "Áo khoác jean",
      category: "Áo khoác",
      sales: 75,
      revenue: 18750000,
      stock: 20,
    },
  ];

  // Low stock products
  const lowStockProducts = [
    {
      id: "SP006",
      name: "Áo len nam",
      category: "Áo len",
      stock: 5,
      threshold: 10,
    },
    {
      id: "SP007",
      name: "Quần tây nam",
      category: "Quần tây",
      stock: 3,
      threshold: 10,
    },
    {
      id: "SP008",
      name: "Áo vest nam",
      category: "Áo vest",
      stock: 7,
      threshold: 10,
    },
  ];

  // Category performance data
  const categoryPerformance = [
    {
      id: 1,
      name: "Áo thun",
      sales: 280,
      revenue: 42000000,
      products: 25,
      growth: 15,
    },
    {
      id: 2,
      name: "Quần jean",
      sales: 215,
      revenue: 43000000,
      products: 18,
      growth: 8,
    },
    {
      id: 3,
      name: "Áo sơ mi",
      sales: 190,
      revenue: 28500000,
      products: 22,
      growth: 5,
    },
    {
      id: 4,
      name: "Váy",
      sales: 150,
      revenue: 22500000,
      products: 20,
      growth: 12,
    },
    {
      id: 5,
      name: "Phụ kiện",
      sales: 145,
      revenue: 14500000,
      products: 35,
      growth: -3,
    },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Báo cáo & Thống kê", active: true },
  ];

  // Update time labels when orderTimeRange changes
  useEffect(() => {
    setOrderTimeLabel(generateDateLabels(orderTimeRange));
  }, [orderTimeRange]);

  // Set date range based on selection
  useEffect(() => {
    const today = new Date();
    const from = new Date();

    switch (dateRange) {
      case "week":
        from.setDate(today.getDate() - 7);
        break;
      case "month":
        from.setMonth(today.getMonth() - 1);
        break;
      case "quarter":
        from.setMonth(today.getMonth() - 3);
        break;
      case "year":
        from.setFullYear(today.getFullYear() - 1);
        break;
      default:
        from.setDate(today.getDate() - 7);
    }

    setDateFrom(from.toISOString().split("T")[0]);
    setDateTo(today.toISOString().split("T")[0]);

    // Calculate summary data (in real app, would fetch from API based on date range)
    setSummaryData({
      totalRevenue: 125500000,
      totalOrders: 550,
      averageOrderValue: 228182,
      totalProducts: 120,
      lowStockProducts: 8,
      topCategory: "Áo thun",
    });

    setIsLoading(false);
  }, [dateRange]);

  // Initialize charts when data is ready
  useEffect(() => {
    if (isLoading) return;

    let mainChartInstance,
      categoryChartInstance,
      productPerformanceChartInstance;

    // Create main chart
    if (mainChartRef.current) {
      mainChartInstance = new Chart(mainChartRef.current, {
        type: "line",
        data: revenueData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text:
                reportType === "revenue"
                  ? "Báo cáo doanh thu"
                  : "Báo cáo đơn hàng",
              font: {
                size: 16,
              },
            },
            legend: {
              position: "top",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Create category chart
    if (categoryChartRef.current) {
      categoryChartInstance = new Chart(categoryChartRef.current, {
        type: "doughnut",
        data: categoryData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
          },
        },
      });
    }

    // Create product performance chart
    if (productPerformanceChartRef.current) {
      productPerformanceChartInstance = new Chart(
        productPerformanceChartRef.current,
        {
          type: "line",
          data: productPerformanceData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Hiệu suất top 3 sản phẩm bán chạy",
                font: {
                  size: 16,
                },
              },
              legend: {
                position: "top",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        }
      );
    }

    // Cleanup charts on unmount
    return () => {
      if (mainChartInstance) mainChartInstance.destroy();
      if (categoryChartInstance) categoryChartInstance.destroy();
      if (productPerformanceChartInstance)
        productPerformanceChartInstance.destroy();
    };
  }, [isLoading, reportType]);

  // Helper function to generate date labels
  const generateDateLabels = (timeRange) => {
    const today = new Date();
    const currentPeriodEnd = new Date(today);
    const currentPeriodStart = new Date(today);
    let previousPeriodEnd = new Date(today);
    let previousPeriodStart = new Date(today);

    // Format date function
    const formatDate = (date) => {
      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    };

    switch (timeRange) {
      case "week":
        // Current: Last 7 days
        currentPeriodStart.setDate(today.getDate() - 6);
        // Previous: 7 days before current period
        previousPeriodEnd.setDate(today.getDate() - 7);
        previousPeriodStart.setDate(today.getDate() - 13);
        break;
      case "month":
        // Current: Last 30 days
        currentPeriodStart.setDate(today.getDate() - 29);
        // Previous: 30 days before current period
        previousPeriodEnd.setDate(today.getDate() - 30);
        previousPeriodStart.setDate(today.getDate() - 59);
        break;
      case "quarter":
        // Current: Last 3 months
        currentPeriodStart.setMonth(today.getMonth() - 2);
        currentPeriodStart.setDate(1);
        // Previous: 3 months before current period
        previousPeriodEnd.setDate(currentPeriodStart.getDate() - 1);
        previousPeriodStart = new Date(previousPeriodEnd);
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 2);
        previousPeriodStart.setDate(1);
        break;
      case "year":
        // Current: Last 12 months
        currentPeriodStart.setFullYear(today.getFullYear() - 1);
        currentPeriodStart.setDate(today.getDate() + 1);
        // Previous: 12 months before current period
        previousPeriodEnd = new Date(currentPeriodStart);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
        previousPeriodStart = new Date(previousPeriodEnd);
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
        previousPeriodStart.setDate(previousPeriodStart.getDate() + 1);
        break;
      default:
        // Default to week
        currentPeriodStart.setDate(today.getDate() - 6);
        previousPeriodEnd.setDate(today.getDate() - 7);
        previousPeriodStart.setDate(today.getDate() - 13);
    }

    return {
      current: `${
        timeRange === "week"
          ? "7 ngày"
          : timeRange === "month"
          ? "30 ngày"
          : timeRange === "quarter"
          ? "3 tháng"
          : "12 tháng"
      } gần nhất (${formatDate(currentPeriodStart)} - ${formatDate(
        currentPeriodEnd
      )})`,
      previous: `kỳ trước (${formatDate(previousPeriodStart)} - ${formatDate(
        previousPeriodEnd
      )})`,
    };
  };

  const handleUpdateOrderAnalysis = () => {
    // logic
    // gọi api để lấy dữ liệu mới cho phân tích đơn hàng
    // api khi gửi sẽ kèm theo orderTimeRange, dateFrom, dateTo
    // khi nhận đc data thì cập nhật state để hiển thị trong phần so với kỳ trước
  };

  return (
    <AdminLayout title="Báo cáo và Thống kê">
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Báo cáo & Thống kê</h1>
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
          {/* Filters */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Bộ lọc báo cáo</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Loại báo cáo</label>
                    <select
                      className="form-control"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="revenue">Doanh thu</option>
                      <option value="orders">Đơn hàng</option>
                      <option value="products">Sản phẩm</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Khoảng thời gian</label>
                    <select
                      className="form-control"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="week">7 ngày qua</option>
                      <option value="month">30 ngày qua</option>
                      <option value="quarter">3 tháng qua</option>
                      <option value="year">1 năm qua</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>
                  </div>
                </div>
                {dateRange === "custom" && (
                  <>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Từ ngày</label>
                        <input
                          type="date"
                          className="form-control"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Đến ngày</label>
                        <input
                          type="date"
                          className="form-control"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-2">
                <button className="btn btn-primary">
                  <i className="fas fa-sync-alt mr-1"></i> Cập nhật báo cáo
                </button>
                <button className="btn btn-outline-secondary ml-2">
                  <i className="fas fa-download mr-1"></i> Xuất báo cáo
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="row">
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{formatCurrency(summaryData.totalRevenue)}</h3>
                  <p>Tổng doanh thu</p>
                </div>
                <div className="icon">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <a href="#" className="small-box-footer">
                  Chi tiết <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{summaryData.totalOrders}</h3>
                  <p>Đơn hàng</p>
                </div>
                <div className="icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <a href="#geographic-distribution" className="small-box-footer">
                  Chi tiết <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{formatCurrency(summaryData.averageOrderValue)}</h3>
                  <p>Giá trị trung bình/đơn</p>
                </div>
                <div className="icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <a href="#top-products" className="small-box-footer">
                  Chi tiết <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-danger">
                <div className="inner">
                  <h3>{summaryData.lowStockProducts}</h3>
                  <p>Sản phẩm sắp hết hàng</p>
                </div>
                <div className="icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <Link href="#low-stock" className="small-box-footer">
                  Chi tiết <i className="fas fa-arrow-circle-right"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Charts */}
          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Biểu đồ doanh thu & đơn hàng</h3>
                  <div className="card-tools">
                    <button
                      type="button"
                      className="btn btn-tool"
                      data-card-widget="collapse"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div
                    className="chart-container"
                    style={{ position: "relative", height: "300px" }}
                  >
                    <canvas ref={mainChartRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Doanh thu theo danh mục</h3>
                  <div className="card-tools">
                    <button
                      type="button"
                      className="btn btn-tool"
                      data-card-widget="collapse"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div
                    className="chart-container"
                    style={{ position: "relative", height: "300px" }}
                  >
                    <canvas ref={categoryChartRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="card" id="top-products">
            <div className="card-header">
              <h3 className="card-title">Top 5 sản phẩm bán chạy</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Mã SP</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Đã bán</th>
                    <th>Doanh thu</th>
                    <th>Tồn kho</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.sales}</td>
                      <td>{formatCurrency(product.revenue)}</td>
                      <td>
                        <span
                          className={`badge ${
                            product.stock < 20 ? "bg-warning" : "bg-success"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Performance Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Xu hướng bán hàng - Top 3 sản phẩm</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <div
                className="chart-container"
                style={{ position: "relative", height: "300px" }}
              >
                <canvas ref={productPerformanceChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Hiệu suất theo danh mục</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Danh mục</th>
                    <th>Số lượng bán</th>
                    <th>Doanh thu</th>
                    <th>Số sản phẩm</th>
                    <th>Tăng trưởng</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryPerformance.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.sales}</td>
                      <td>{formatCurrency(category.revenue)}</td>
                      <td>{category.products}</td>
                      <td>
                        <span
                          className={`badge ${
                            category.growth >= 0 ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {category.growth >= 0
                            ? `+${category.growth}%`
                            : `${category.growth}%`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="card" id="low-stock">
            <div className="card-header">
              <h3 className="card-title">Sản phẩm sắp hết hàng</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Mã SP</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Tồn kho</th>
                    <th>Ngưỡng cảnh báo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>
                        <span
                          className={`badge ${
                            product.stock <= 5 ? "bg-danger" : "bg-warning"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td>{product.threshold}</td>
                      <td>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="btn btn-sm btn-info"
                        >
                          <i className="fas fa-edit mr-1"></i> Cập nhật
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Analysis */}
          <div className="card" id="order-analysis">
            <div className="card-header">
              <h3 className="card-title">Phân tích đơn hàng</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              {/* Time filter for order analysis */}
              <div className="mb-4">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="btn-group">
                      <button
                        type="button"
                        className={`btn ${
                          orderTimeRange === "week"
                            ? "btn-primary"
                            : "btn-default"
                        }`}
                        onClick={() => setOrderTimeRange("week")}
                      >
                        7 ngày
                      </button>
                      <button
                        type="button"
                        className={`btn ${
                          orderTimeRange === "month"
                            ? "btn-primary"
                            : "btn-default"
                        }`}
                        onClick={() => setOrderTimeRange("month")}
                      >
                        30 ngày
                      </button>
                      <button
                        type="button"
                        className={`btn ${
                          orderTimeRange === "quarter"
                            ? "btn-primary"
                            : "btn-default"
                        }`}
                        onClick={() => setOrderTimeRange("quarter")}
                      >
                        3 tháng
                      </button>
                      <button
                        type="button"
                        className={`btn ${
                          orderTimeRange === "year"
                            ? "btn-primary"
                            : "btn-default"
                        }`}
                        onClick={() => setOrderTimeRange("year")}
                      >
                        1 năm
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6 text-right">
                    <div className="d-inline-flex align-items-center">
                      <span className="text-muted">
                        <i className="fas fa-info-circle mr-1"></i>
                        Tự động so sánh với kỳ trước tương đương
                      </span>
                      <button
                        className="btn btn-sm btn-outline-primary ml-2"
                        onClick={() => handleUpdateOrderAnalysis()}
                      >
                        <i className="fas fa-sync-alt"></i> Cập nhật
                      </button>
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="callout callout-info">
                      <h5>
                        Tổng quan kỳ hiện tại: <br />
                        {orderTimeLabel.current}
                      </h5>
                      <p className="mb-0">
                        Tổng đơn hàng: <strong>550</strong> | Tỷ lệ hoàn thành:{" "}
                        <strong>88.5%</strong> | Giá trị TB:{" "}
                        <strong>{formatCurrency(228182)}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="callout callout-warning">
                      <h5>So với {orderTimeLabel.previous}</h5>
                      <p className="mb-0">
                        Đơn hàng:{" "}
                        <span className="text-success">
                          +12.2% <i className="fas fa-arrow-up"></i>
                        </span>{" "}
                        | Tỷ lệ hoàn thành:{" "}
                        <span className="text-success">
                          +3.5% <i className="fas fa-arrow-up"></i>
                        </span>{" "}
                        | Giá trị TB:{" "}
                        <span className="text-success">
                          +5.8% <i className="fas fa-arrow-up"></i>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                {/* Order Status Distribution */}
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-header border-0">
                      <h3 className="card-title">Trạng thái đơn hàng</h3>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
                        <p className="d-flex flex-column">
                          <span className="text-success font-weight-bold">
                            315 đơn
                          </span>
                          <span className="text-muted">Đã giao hàng</span>
                        </p>
                        <p className="d-flex flex-column text-right">
                          <span className="font-weight-bold">57.3%</span>
                          <span className="text-success">
                            <i className="fas fa-arrow-up"></i> 8.2%
                          </span>
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
                        <p className="d-flex flex-column">
                          <span className="text-info font-weight-bold">
                            95 đơn
                          </span>
                          <span className="text-muted">Đang xử lý</span>
                        </p>
                        <p className="d-flex flex-column text-right">
                          <span className="font-weight-bold">17.3%</span>
                          <span className="text-muted">
                            <i className="fas fa-equals"></i> 0.3%
                          </span>
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
                        <p className="d-flex flex-column">
                          <span className="text-warning font-weight-bold">
                            75 đơn
                          </span>
                          <span className="text-muted">Đang giao hàng</span>
                        </p>
                        <p className="d-flex flex-column text-right">
                          <span className="font-weight-bold">13.6%</span>
                          <span className="text-success">
                            <i className="fas fa-arrow-up"></i> 2.1%
                          </span>
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-0">
                        <p className="d-flex flex-column">
                          <span className="text-danger font-weight-bold">
                            65 đơn
                          </span>
                          <span className="text-muted">Đã hủy</span>
                        </p>
                        <p className="d-flex flex-column text-right">
                          <span className="font-weight-bold">11.8%</span>
                          <span className="text-danger">
                            <i className="fas fa-arrow-down"></i> 1.4%
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-header border-0">
                      <h3 className="card-title">Thông tin thời gian</h3>
                    </div>
                    <div className="card-body">
                      <div className="info-box bg-light">
                        <div className="info-box-content">
                          <span className="info-box-text text-center text-muted">
                            Thời gian xử lý trung bình
                          </span>
                          <span className="info-box-number text-center text-muted mb-0">
                            1.2 ngày
                          </span>
                        </div>
                      </div>
                      <div className="info-box bg-light">
                        <div className="info-box-content">
                          <span className="info-box-text text-center text-muted">
                            Thời gian giao hàng trung bình
                          </span>
                          <span className="info-box-number text-center text-muted mb-0">
                            2.5 ngày
                          </span>
                        </div>
                      </div>
                      <div className="info-box bg-light">
                        <div className="info-box-content">
                          <span className="info-box-text text-center text-muted">
                            Tổng thời gian trung bình
                          </span>
                          <span className="info-box-number text-center text-muted mb-0">
                            3.7 ngày
                          </span>
                        </div>
                      </div>
                      <div className="progress-group">
                        Tỷ lệ giao hàng đúng hạn
                        <span className="float-right">
                          <b>87</b>/100
                        </span>
                        <div className="progress">
                          <div
                            className="progress-bar bg-success"
                            style={{ width: "87%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-header border-0">
                      <h3 className="card-title">Phương thức thanh toán</h3>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
                        <p className="d-flex flex-column">
                          <span className="font-weight-bold">Thẻ tín dụng</span>
                          <span className="text-muted">148 đơn</span>
                        </p>
                        <p className="d-flex flex-column text-right">
                          <span className="font-weight-bold">26.9%</span>
                          <span className="text-success">
                            <i className="fas fa-arrow-up"></i> 5.3%
                          </span>
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
                        <p className="d-flex flex-column">
                          <span className="font-weight-bold">Ví điện tử</span>
                          <span className="text-muted">195 đơn</span>
                        </p>
                        <p className="d-flex flex-column text-right">
                          <span className="font-weight-bold">35.5%</span>
                          <span className="text-success">
                            <i className="fas fa-arrow-up"></i> 6.8%
                          </span>
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
                        <p className="d-flex flex-column">
                          <span className="font-weight-bold">Chuyển khoản</span>
                          <span className="text-muted">120 đơn</span>
                        </p>
                        <p className="d-flex flex-column text-right">
                          <span className="font-weight-bold">21.8%</span>
                          <span className="text-muted">
                            <i className="fas fa-equals"></i> 0.2%
                          </span>
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-0">
                        <p className="d-flex flex-column">
                          <span className="font-weight-bold">COD</span>
                          <span className="text-muted">87 đơn</span>
                        </p>
                        <p className="d-flex flex-column text-right">
                          <span className="font-weight-bold">15.8%</span>
                          <span className="text-danger">
                            <i className="fas fa-arrow-down"></i> 4.5%
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Distribution (Expanded) */}
              <div className="row mt-4" id="geographic-distribution">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">
                        Phân bố đơn hàng theo khu vực địa lý
                      </h3>
                      <div className="card-tools">
                        <button
                          type="button"
                          className="btn btn-tool"
                          data-card-widget="collapse"
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-7">
                          <div className="table-responsive">
                            <table className="table table-striped">
                              <thead>
                                <tr>
                                  <th>Khu vực</th>
                                  <th>Đơn hàng</th>
                                  <th>Doanh thu</th>
                                  <th>Tỷ lệ</th>
                                  <th>Tăng trưởng</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>TP Hồ Chí Minh</td>
                                  <td>210</td>
                                  <td>{formatCurrency(52500000)}</td>
                                  <td>
                                    <div className="progress progress-xs">
                                      <div
                                        className="progress-bar bg-primary"
                                        style={{ width: "38.2%" }}
                                      ></div>
                                    </div>
                                    <span className="text-muted">38.2%</span>
                                  </td>
                                  <td>
                                    <span className="badge bg-success">
                                      +12.5%
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Hà Nội</td>
                                  <td>175</td>
                                  <td>{formatCurrency(43750000)}</td>
                                  <td>
                                    <div className="progress progress-xs">
                                      <div
                                        className="progress-bar bg-primary"
                                        style={{ width: "31.8%" }}
                                      ></div>
                                    </div>
                                    <span className="text-muted">31.8%</span>
                                  </td>
                                  <td>
                                    <span className="badge bg-success">
                                      +8.3%
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Đà Nẵng</td>
                                  <td>65</td>
                                  <td>{formatCurrency(16250000)}</td>
                                  <td>
                                    <div className="progress progress-xs">
                                      <div
                                        className="progress-bar bg-primary"
                                        style={{ width: "11.8%" }}
                                      ></div>
                                    </div>
                                    <span className="text-muted">11.8%</span>
                                  </td>
                                  <td>
                                    <span className="badge bg-success">
                                      +5.2%
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Hải Phòng</td>
                                  <td>35</td>
                                  <td>{formatCurrency(8750000)}</td>
                                  <td>
                                    <div className="progress progress-xs">
                                      <div
                                        className="progress-bar bg-primary"
                                        style={{ width: "6.4%" }}
                                      ></div>
                                    </div>
                                    <span className="text-muted">6.4%</span>
                                  </td>
                                  <td>
                                    <span className="badge bg-warning">
                                      +0.8%
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Cần Thơ</td>
                                  <td>30</td>
                                  <td>{formatCurrency(7500000)}</td>
                                  <td>
                                    <div className="progress progress-xs">
                                      <div
                                        className="progress-bar bg-primary"
                                        style={{ width: "5.5%" }}
                                      ></div>
                                    </div>
                                    <span className="text-muted">5.5%</span>
                                  </td>
                                  <td>
                                    <span className="badge bg-success">
                                      +3.7%
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Nha Trang</td>
                                  <td>20</td>
                                  <td>{formatCurrency(5000000)}</td>
                                  <td>
                                    <div className="progress progress-xs">
                                      <div
                                        className="progress-bar bg-primary"
                                        style={{ width: "3.6%" }}
                                      ></div>
                                    </div>
                                    <span className="text-muted">3.6%</span>
                                  </td>
                                  <td>
                                    <span className="badge bg-success">
                                      +2.1%
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Huế</td>
                                  <td>15</td>
                                  <td>{formatCurrency(3750000)}</td>
                                  <td>
                                    <div className="progress progress-xs">
                                      <div
                                        className="progress-bar bg-primary"
                                        style={{ width: "2.7%" }}
                                      ></div>
                                    </div>
                                    <span className="text-muted">2.7%</span>
                                  </td>
                                  <td>
                                    <span className="badge bg-danger">
                                      -1.2%
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <td>Khác</td>
                                  <td>0</td>
                                  <td>{formatCurrency(0)}</td>
                                  <td>
                                    <div className="progress progress-xs">
                                      <div
                                        className="progress-bar bg-primary"
                                        style={{ width: "0%" }}
                                      ></div>
                                    </div>
                                    <span className="text-muted">0%</span>
                                  </td>
                                  <td>
                                    <span className="badge bg-secondary">
                                      0%
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="col-md-5">
                          <div className="card bg-gradient-primary">
                            <div className="card-header border-0">
                              <h3 className="card-title">
                                <i className="fas fa-map-marker-alt mr-1"></i>
                                Top khu vực theo tỷ lệ chuyển đổi
                              </h3>
                            </div>
                            <div className="card-body">
                              <div className="column">
                                <div className="">
                                  <div className="info-box mb-3 bg-white">
                                    <span className="info-box-icon">
                                      <i className="fas fa-star text-warning"></i>
                                    </span>
                                    <div className="info-box-content">
                                      <span className="info-box-text text-muted">
                                        TP Hồ Chí Minh
                                      </span>
                                      <span className="info-box-number">
                                        Tỷ lệ: 8.7%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="">
                                  <div className="info-box mb-3 bg-white">
                                    <span className="info-box-icon">
                                      <i className="fas fa-star text-warning"></i>
                                    </span>
                                    <div className="info-box-content">
                                      <span className="info-box-text text-muted">
                                        Hà Nội
                                      </span>
                                      <span className="info-box-number">
                                        Tỷ lệ: 7.9%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <h5 className="mt-3 text-white">
                                Giá trị đơn hàng trung bình theo khu vực
                              </h5>
                              <ul className="list-group mt-2">
                                <li className="list-group-item d-flex justify-content-between align-items-center text-black">
                                  TP Hồ Chí Minh
                                  <span className="badge bg-white text-primary rounded-pill">
                                    {formatCurrency(250000)}
                                  </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center text-black">
                                  Hà Nội
                                  <span className="badge bg-white text-primary rounded-pill">
                                    {formatCurrency(230000)}
                                  </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center text-black">
                                  Đà Nẵng
                                  <span className="badge bg-white text-primary rounded-pill">
                                    {formatCurrency(210000)}
                                  </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center text-black">
                                  Hải Phòng
                                  <span className="badge bg-white text-primary rounded-pill">
                                    {formatCurrency(195000)}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer bg-light">
                      <div className="row">
                        <div className="col-md-4">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-info-circle text-primary mr-2"></i>
                            <span className="text-muted">
                              Thị trường trọng điểm:{" "}
                              <strong>TP Hồ Chí Minh, Hà Nội, Đà Nẵng</strong>
                            </span>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-chart-line text-success mr-2"></i>
                            <span className="text-muted">
                              Tăng trưởng cao nhất:{" "}
                              <strong>TP Hồ Chí Minh (+12.5%)</strong>
                            </span>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-bullseye text-danger mr-2"></i>
                            <span className="text-muted">
                              Tiềm năng phát triển:{" "}
                              <strong>Cần Thơ, Nha Trang</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
