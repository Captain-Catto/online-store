"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Chart from "chart.js/auto";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import Link from "next/link";
import { formatCurrency } from "@/utils/currencyUtils";
import { ReportsService } from "@/services/ReportsService";
import { colorToVietnamese } from "@/utils/colorUtils";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";

interface ProductVariant {
  detailId: number;
  size: string;
  color: string;
  stock: number;
  needsRestock: boolean;
}

interface LowStockProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  threshold: number;
  variants: ProductVariant[];
  totalVariants: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("week");
  const [reportType, setReportType] = useState("revenue");
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  // States for order analysis time periods
  const [orderTimeRange, setOrderTimeRange] = useState("week");
  const [orderTimeLabel, setOrderTimeLabel] = useState({
    current: "",
    previous: "",
  });

  // Chart refs
  const mainChartRef = useRef<HTMLCanvasElement | null>(null);
  const categoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const productPerformanceChartRef = useRef<HTMLCanvasElement | null>(null);

  // State for summary data
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    topCategory: "",
  });

  // State for revenue and orders chart
  const [revenueData, setRevenueData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      tension: number;
      fill: boolean;
    }>;
  }>({
    labels: [],
    datasets: [],
  });

  // State for category revenue chart
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [],
  });

  // State for product performance chart
  const [productPerformanceData, setProductPerformanceData] = useState({
    labels: [],
    datasets: [],
  });

  interface TopProduct {
    id: number;
    sku: string;
    name: string;
    category: string;
    sales: number;
    revenue: number;
    stock: number;
  }

  // State for top selling products
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  // State for low stock products
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );

  interface CategoryPerformanceItem {
    id: number;
    name: string;
    sales: number;
    revenue: number;
    products: number;
    growth: number;
  }

  // State for category performance
  const [categoryPerformance, setCategoryPerformance] = useState<
    CategoryPerformanceItem[]
  >([]);

  // State for order analysis
  const [orderAnalysis, setOrderAnalysis] = useState({
    current: {
      totalOrders: 0,
      completionRate: 0,
      averageOrderValue: 0,
    },
    previous: {
      orderGrowth: 0,
      completionRateGrowth: 0,
      averageOrderValueGrowth: 0,
      totalOrders: 0,
      completedOrders: 0,
      avgOrderValue: 0,
    },
    statuses: [
      { name: "Đã giao hàng", count: 0, percentage: 0, growth: 0 },
      { name: "Đang xử lý", count: 0, percentage: 0, growth: 0 },
      { name: "Đang giao hàng", count: 0, percentage: 0, growth: 0 },
      { name: "Đã hủy", count: 0, percentage: 0, growth: 0 },
    ],
    paymentMethods: [
      { name: "Thẻ tín dụng", count: 0, percentage: 0, growth: 0 },
      { name: "Ví điện tử", count: 0, percentage: 0, growth: 0 },
      { name: "Chuyển khoản", count: 0, percentage: 0, growth: 0 },
      { name: "COD", count: 0, percentage: 0, growth: 0 },
    ],
    timelines: {
      averageProcessingTime: 0,
      averageDeliveryTime: 0,
      averageTotalTime: 0,
      onTimeDeliveryRate: 0,
    },
  });

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Báo cáo & Thống kê", active: true },
  ];

  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push("/login");
    }
  }, [router]);

  // Helper function to generate date labels
  const generateDateLabels = (timeRange: string) => {
    const today = new Date();
    const currentPeriodEnd = new Date(today);
    const currentPeriodStart = new Date(today);
    let previousPeriodEnd = new Date(today);
    let previousPeriodStart = new Date(today);

    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    };

    switch (timeRange) {
      case "week":
        currentPeriodStart.setDate(today.getDate() - 6);
        previousPeriodEnd.setDate(today.getDate() - 7);
        previousPeriodStart.setDate(today.getDate() - 13);
        break;
      case "month":
        currentPeriodStart.setDate(today.getDate() - 29);
        previousPeriodEnd.setDate(today.getDate() - 30);
        previousPeriodStart.setDate(today.getDate() - 59);
        break;
      case "quarter":
        currentPeriodStart.setMonth(today.getMonth() - 2);
        currentPeriodStart.setDate(1);
        previousPeriodEnd.setDate(currentPeriodStart.getDate() - 1);
        previousPeriodStart = new Date(previousPeriodEnd);
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 2);
        previousPeriodStart.setDate(1);
        break;
      case "year":
        currentPeriodStart.setFullYear(today.getFullYear() - 1);
        currentPeriodStart.setDate(today.getDate() + 1);
        previousPeriodEnd = new Date(currentPeriodStart);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
        previousPeriodStart = new Date(previousPeriodEnd);
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
        previousPeriodStart.setDate(previousPeriodStart.getDate() + 1);
        break;
      default:
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

  // Fetch all report data
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = {
      dateRange,
      ...(dateRange === "custom" && { fromDate: dateFrom, toDate: dateTo }),
    };

    try {
      // Fetch summary report
      const summaryResponse = await ReportsService.getSummaryReport(params);
      setSummaryData({
        totalRevenue: summaryResponse.totalRevenue || 0,
        totalOrders: summaryResponse.totalOrders || 0,
        averageOrderValue: summaryResponse.averageOrderValue || 0,
        totalProducts: summaryResponse.totalProducts || 0,
        lowStockProducts: summaryResponse.lowStockProducts || 0,
        topCategory: summaryResponse.topCategory || "",
      });

      // Fetch revenue report
      const revenueResponse = await ReportsService.getRevenueReport(params);
      setRevenueData(revenueResponse);

      // Fetch category revenue report
      const categoryResponse = await ReportsService.getCategoryRevenueReport(
        params
      );

      setCategoryData(categoryResponse);

      // Fetch top products report
      const topProductsResponse = await ReportsService.getTopProductsReport(
        params
      );
      setTopProducts(topProductsResponse?.products || []);
      // Fetch product performance report
      const productPerformanceResponse =
        await ReportsService.getProductPerformanceReport(params);
      setProductPerformanceData(productPerformanceResponse);

      // Fetch category performance report
      const categoryPerformanceResponse =
        await ReportsService.getCategoryPerformanceReport(params);
      setCategoryPerformance(categoryPerformanceResponse || []);

      // Fetch low stock products report
      const lowStockResponse = await ReportsService.getLowStockProductsReport(
        params
      );
      setLowStockProducts(lowStockResponse || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Lỗi khi lấy dữ liệu báo cáo");
      } else {
        setError("Lỗi khi lấy dữ liệu báo cáo");
      }
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, dateFrom, dateTo]);

  // Fetch order analysis data
  const handleUpdateOrderAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = {
      dateRange: orderTimeRange,
      ...(orderTimeRange === "custom" && {
        fromDate: dateFrom,
        toDate: dateTo,
      }),
    };

    try {
      const response = await ReportsService.getOrderAnalysisReport(params);
      setOrderAnalysis({
        current: {
          totalOrders: response.current.totalOrders || 0,
          completionRate: parseFloat(response.current.completionRate || "0"),
          averageOrderValue: response.current.avgOrderValue || 0,
        },
        previous: {
          orderGrowth: parseFloat(response.growth.orders || "0"),
          completionRateGrowth: parseFloat(
            response.growth.completionRate || "0"
          ),
          averageOrderValueGrowth: parseFloat(response.growth.avgValue || "0"),
          totalOrders: response.growth.totalOrders || 0,
          completedOrders: response.growth.completedOrders || 0,
          avgOrderValue: response.growth.avgOrderValue || 0,
        },
        statuses: [
          {
            name: "Đã giao hàng",
            count: response.current.statuses?.delivered || 0,
            percentage: response.current.statuses?.delivered
              ? Math.round(
                  (response.current.statuses.delivered /
                    response.current.totalOrders) *
                    100
                )
              : 0,
            growth: 0, // You may need to calculate this if available
          },
          {
            name: "Đang xử lý",
            count: response.current.statuses?.processing || 0,
            percentage: response.current.statuses?.processing
              ? Math.round(
                  (response.current.statuses.processing /
                    response.current.totalOrders) *
                    100
                )
              : 0,
            growth: 0,
          },
          {
            name: "Đang giao hàng",
            count: response.current.statuses?.shipping || 0,
            percentage: response.current.statuses?.shipping
              ? Math.round(
                  (response.current.statuses.shipping /
                    response.current.totalOrders) *
                    100
                )
              : 0,
            growth: 0,
          },
          {
            name: "Đã hủy",
            count: response.current.statuses?.cancelled || 0,
            percentage: response.current.statuses?.cancelled
              ? Math.round(
                  (response.current.statuses.cancelled /
                    response.current.totalOrders) *
                    100
                )
              : 0,
            growth: 0,
          },
        ],
        paymentMethods: Object.entries(
          response.current.paymentMethods || {}
        ).map(([name, data]) => {
          const typedData = data as { count: number; percentage: number };
          return {
            name,
            count: typedData.count || 0,
            percentage: typedData.percentage || 0,
            growth: 0, // Set default value or calculate if available
          };
        }),
        timelines: {
          averageProcessingTime: 0,
          averageDeliveryTime: 0,
          averageTotalTime: 0,
          onTimeDeliveryRate: 0,
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Lỗi khi lấy dữ liệu phân tích đơn hàng");
      } else {
        setError("Lỗi khi lấy dữ liệu phân tích đơn hàng");
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderTimeRange, dateFrom, dateTo]);

  // Fetch initial data when dateRange, dateFrom, or dateTo changes
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

    fetchReports();
  }, [dateRange, dateFrom, dateTo, reportType, fetchReports]);

  // Update time labels when orderTimeRange changes
  useEffect(() => {
    setOrderTimeLabel(generateDateLabels(orderTimeRange));
    handleUpdateOrderAnalysis();
  }, [orderTimeRange, handleUpdateOrderAnalysis]);

  // Initialize charts when data is ready
  useEffect(() => {
    if (isLoading) return;

    let mainChartInstance: Chart | null = null;
    let categoryChartInstance: Chart | null = null;
    let productPerformanceChartInstance: Chart | null = null;

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
              font: { size: 16 },
            },
            legend: { position: "top" },
          },
          scales: { y: { beginAtZero: true } },
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
          plugins: { legend: { position: "right" } },
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
                font: { size: 16 },
              },
              legend: { position: "top" },
            },
            scales: { y: { beginAtZero: true } },
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
  }, [
    isLoading,
    reportType,
    revenueData,
    categoryData,
    productPerformanceData,
  ]);

  const handleNavigateToProduct = (productId: number) => {
    router.push(`/admin/products/${productId}`);
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
          {/* Error Message */}
          {error && (
            <div className="alert alert-danger">
              {error}
              <button
                type="button"
                className="close"
                onClick={() => setError(null)}
              >
                &times;
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="d-flex justify-content-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}

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
                <button
                  className="btn btn-primary"
                  onClick={fetchReports}
                  disabled={isLoading}
                >
                  <i className="fas fa-sync-alt mr-1"></i> Cập nhật báo cáo
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
                    <th>#</th>
                    <th>Mã SP</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Số lượng bán</th>
                    <th>Doanh thu</th>
                    <th>Tồn kho</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length > 0 ? (
                    topProducts.map((product: TopProduct, index) => (
                      <tr key={product.id}>
                        <td>{index + 1}</td>
                        <td>{product.sku}</td>
                        <td>
                          <button
                            className="btn btn-link text-primary p-0"
                            onClick={() => handleNavigateToProduct(product.id)}
                            style={{
                              textDecoration: "none",
                              cursor: "pointer",
                            }}
                          >
                            {product.name}
                          </button>
                        </td>
                        <td>{product.category}</td>
                        <td>{product.sales}</td>
                        <td>{formatCurrency(product.revenue)}</td>
                        <td>
                          <span
                            className={`badge ${
                              product.stock < 10 ? "bg-warning" : "bg-success"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">
                        Không có dữ liệu sản phẩm bán chạy
                      </td>
                    </tr>
                  )}
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
                  {categoryPerformance.length > 0 ? (
                    categoryPerformance.map(
                      (category: CategoryPerformanceItem) => (
                        <tr key={category.id}>
                          <td>{category.name}</td>
                          <td>{category.sales}</td>
                          <td>{formatCurrency(category.revenue)}</td>
                          <td>{category.products}</td>
                          <td>
                            <span
                              className={`badge ${
                                category.growth >= 0
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {category.growth >= 0
                                ? `+${category.growth}%`
                                : `${category.growth}%`}
                            </span>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Không có dữ liệu hiệu suất danh mục
                      </td>
                    </tr>
                  )}
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
                    <th>Biến thể</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((product: LowStockProduct) => (
                      <tr key={product.id}>
                        <td>{product.sku}</td>
                        <td>
                          <button
                            className="btn btn-link text-primary p-0"
                            onClick={() => handleNavigateToProduct(product.id)}
                            style={{
                              textDecoration: "none",
                              cursor: "pointer",
                            }}
                          >
                            {product.name}
                          </button>
                        </td>
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
                          {product.variants && product.variants.length > 0 ? (
                            <div>
                              {product.variants.map(
                                (
                                  variant: {
                                    color: string;
                                    size: string;
                                    needsRestock: boolean;
                                    stock: number;
                                  },
                                  idx: number
                                ) => (
                                  <div key={idx} className="mb-1">
                                    <small>
                                      {colorToVietnamese[variant.color]} -{" "}
                                      {variant.size}:{" "}
                                      <span
                                        className={
                                          variant.needsRestock
                                            ? "text-danger font-weight-bold"
                                            : ""
                                        }
                                      >
                                        {variant.stock} sản phẩm
                                      </span>
                                    </small>
                                  </div>
                                )
                              )}
                              <small className="text-muted">
                                ({product.totalVariants} biến thể)
                              </small>
                            </div>
                          ) : (
                            "Không có biến thể"
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleNavigateToProduct(product.id)}
                          >
                            <i className="fas fa-edit mr-1"></i> Cập nhật
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">
                        Không có sản phẩm sắp hết hàng
                      </td>
                    </tr>
                  )}
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
                        onClick={handleUpdateOrderAnalysis}
                        disabled={isLoading}
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
                        Tổng đơn hàng:{" "}
                        <strong>{orderAnalysis.current.totalOrders}</strong> |
                        Tỷ lệ hoàn thành:{" "}
                        <strong>{orderAnalysis.current.completionRate}%</strong>{" "}
                        | Giá trị TB:{" "}
                        <strong>
                          {formatCurrency(
                            orderAnalysis.current.averageOrderValue
                          )}
                        </strong>
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="callout callout-warning">
                      <h5>So với {orderTimeLabel.previous}</h5>
                      <p className="mb-0">
                        Đơn hàng:{" "}
                        <strong>{orderAnalysis.previous.totalOrders}</strong> (
                        <span
                          className={
                            orderAnalysis.previous.orderGrowth >= 0
                              ? "text-success"
                              : "text-danger"
                          }
                        >
                          {orderAnalysis.previous.orderGrowth >= 0
                            ? `+${orderAnalysis.previous.orderGrowth}%`
                            : `${orderAnalysis.previous.orderGrowth}%`}{" "}
                          <i
                            className={`fas fa-arrow-${
                              orderAnalysis.previous.orderGrowth >= 0
                                ? "up"
                                : "down"
                            }`}
                          ></i>
                        </span>
                        ) | Tỷ lệ hoàn thành:{" "}
                        <strong>
                          {orderAnalysis.previous.completedOrders}
                        </strong>{" "}
                        (
                        <span
                          className={
                            orderAnalysis.previous.completionRateGrowth >= 0
                              ? "text-success"
                              : "text-danger"
                          }
                        >
                          {orderAnalysis.previous.completionRateGrowth >= 0
                            ? `+${orderAnalysis.previous.completionRateGrowth}%`
                            : `${orderAnalysis.previous.completionRateGrowth}%`}{" "}
                          <i
                            className={`fas fa-arrow-${
                              orderAnalysis.previous.completionRateGrowth >= 0
                                ? "up"
                                : "down"
                            }`}
                          ></i>
                        </span>
                        ) | Giá trị TB:{" "}
                        <strong>
                          {formatCurrency(orderAnalysis.previous.avgOrderValue)}
                        </strong>{" "}
                        (
                        <span
                          className={
                            orderAnalysis.previous.averageOrderValueGrowth >= 0
                              ? "text-success"
                              : "text-danger"
                          }
                        >
                          {orderAnalysis.previous.averageOrderValueGrowth >= 0
                            ? `+${orderAnalysis.previous.averageOrderValueGrowth}%`
                            : `${orderAnalysis.previous.averageOrderValueGrowth}%`}{" "}
                          <i
                            className={`fas fa-arrow-${
                              orderAnalysis.previous.averageOrderValueGrowth >=
                              0
                                ? "up"
                                : "down"
                            }`}
                          ></i>
                        </span>
                        )
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                {/* Order Status Distribution */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header border-0">
                      <h3 className="card-title">Trạng thái đơn hàng</h3>
                    </div>
                    <div className="card-body">
                      {orderAnalysis.statuses.map((status, index) => (
                        <div
                          key={index}
                          className={`d-flex justify-content-between  ${
                            index < orderAnalysis.statuses.length - 1
                              ? "border-bottom mb-3"
                              : "mb-0"
                          }`}
                        >
                          <p className="d-flex flex-column">
                            <span
                              className={`font-weight-bold ${
                                status.name === "Đã giao hàng"
                                  ? "text-success"
                                  : status.name === "Đang xử lý"
                                  ? "text-info"
                                  : status.name === "Đang giao hàng"
                                  ? "text-warning"
                                  : "text-danger"
                              }`}
                            >
                              {status.count} đơn
                            </span>
                            <span className="text-muted">{status.name}</span>
                          </p>
                          <p className="d-flex flex-column text-right">
                            <span className="font-weight-bold">
                              {status.percentage}%
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header border-0">
                      <h3 className="card-title">Phương thức thanh toán</h3>
                    </div>
                    <div className="card-body">
                      {orderAnalysis.paymentMethods.map((method, index) => (
                        <div
                          key={index}
                          className={`d-flex justify-content-between ${
                            index < orderAnalysis.paymentMethods.length - 1
                              ? "border-bottom mb-3"
                              : "mb-0"
                          }`}
                        >
                          <p className="d-flex flex-column">
                            <span className="font-weight-bold">
                              {method.name}
                            </span>
                            <span className="text-muted">
                              {method.count} đơn
                            </span>
                          </p>
                          <p className="d-flex flex-column text-right">
                            <span className="font-weight-bold">
                              {method.percentage.toFixed(2)}%
                            </span>
                          </p>
                        </div>
                      ))}
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
