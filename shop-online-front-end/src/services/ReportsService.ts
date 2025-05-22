import { API_BASE_URL } from "@/config/apiConfig";

export const ReportsService = {
  // Fetch summary report
  async getSummaryReport(
    params: { dateRange?: string; fromDate?: string; toDate?: string } = {}
  ) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/reports/summary?${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch summary report");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Fetch revenue and orders report (for main chart)
  async getRevenueReport(
    params: { dateRange?: string; fromDate?: string; toDate?: string } = {}
  ) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/reports/revenue?${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch revenue report");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Fetch category revenue report (for doughnut chart)
  async getCategoryRevenueReport(
    params: { dateRange?: string; fromDate?: string; toDate?: string } = {}
  ) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE_URL}/reports/top-categories?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch category revenue report");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Fetch top products report
  async getTopProductsReport(
    params: { dateRange?: string; fromDate?: string; toDate?: string } = {}
  ) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE_URL}/reports/top-products?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch top products report");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Fetch product performance report (for top 3 products chart)
  async getProductPerformanceReport(
    params: { dateRange?: string; fromDate?: string; toDate?: string } = {}
  ) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE_URL}/reports/product-performance?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch product performance report");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Fetch category performance report
  async getCategoryPerformanceReport(
    params: { dateRange?: string; fromDate?: string; toDate?: string } = {}
  ) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE_URL}/reports/category-performance?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch category performance report");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Fetch low stock products report
  async getLowStockProductsReport(
    params: { dateRange?: string; fromDate?: string; toDate?: string } = {}
  ) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE_URL}/reports/low-stock?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch low stock products report");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Fetch order analysis report
  async getOrderAnalysisReport(
    params: { dateRange?: string; fromDate?: string; toDate?: string } = {}
  ) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE_URL}/reports/order-analysis?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order analysis report");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};
