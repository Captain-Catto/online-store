"use client";
import { ReactNode, useState, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import { useDevice } from "@/contexts/DeviceContext";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({
  children,
  title = "Admin Dashboard",
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openMenuIds, setOpenMenuIds] = useState<number[]>([]);
  const { isMobile, isTablet } = useDevice();

  // Automatically collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      // On mobile: hoàn toàn ẩn sidebar
      setSidebarCollapsed(true);
    } else if (isTablet) {
      // On tablet: chỉ hiển thị icon sidebar
      setSidebarCollapsed(true);
    } else {
      // On desktop: hiển thị sidebar bình thường
      setSidebarCollapsed(false);
    }
  }, [isMobile, isTablet]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Toggle menu bằng cách thêm/xóa ID từ array
  const toggleMenu = (id: number) => {
    setOpenMenuIds((prev) => {
      // Nếu id đã tồn tại, xóa nó (đóng menu)
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      // Nếu chưa có, thêm vào (mở menu)
      else {
        return [...prev, id];
      }
    });
  };

  return (
    <>
      <Head>
        <title>{title} - Online Store</title>
      </Head>

      {/* AdminLTE CSS và script */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Custom CSS for mobile sidebar */}
      <style jsx global>{`
        @media (max-width: 767.98px) {
          body:not(.sidebar-open) .main-sidebar {
            transform: translateX(-250px);
          }

          body .content-wrapper,
          body .main-footer {
            margin-left: 0 !important;
          }
        }
      `}</style>

      <div
        className={`wrapper 
              ${sidebarCollapsed ? "sidebar-collapse" : ""} 
              ${isMobile ? "sidebar-closed sidebar-collapse" : ""} 
              ${!isMobile && isTablet ? "sidebar-mini-md sidebar-mini" : ""} 
              sidebar-mini layout-fixed`}
      >
        <AdminNavbar toggleSidebar={toggleSidebar} />
        {/* Conditionally render sidebar based on screen size */}
        <AdminSidebar openMenuIds={openMenuIds} toggleMenu={toggleMenu} />

        {/* Content Wrapper */}
        <div className="content-wrapper">{children}</div>

        <AdminFooter />
      </div>

      {/* Custom CSS for responsive sidebar */}
      <style jsx global>{`
        /* Mobile sidebar (hidden) */
        @media (max-width: 767.98px) {
          body:not(.sidebar-open) .main-sidebar {
            transform: translateX(-250px);
          }

          body .content-wrapper,
          body .main-footer {
            margin-left: 0 !important;
          }
        }

        /* Tablet sidebar (icon-only) */
        @media (min-width: 768px) and (max-width: 991.98px) {
          /* khi ở tablet thì sidebar sẽ hiển thị đúng icon thôi */
          body.sidebar-mini .content-wrapper,
          body.sidebar-mini .main-footer {
            margin-left: 4.6rem !important;
          }

          /* Ensure text is hidden in sidebar */
          body.sidebar-mini .nav-sidebar .nav-link p {
            width: 0;
            white-space: nowrap;
          }

          /* Ẩn thông tin user panel */
          .user-panel .info {
            display: none !important;
          }

          /* Ẩn brand text trên logo */
          body.sidebar-mini .brand-text {
            display: none !important;
          }

          /* Adjust sidebar width in mini mode */
          body.sidebar-mini .main-sidebar,
          body.sidebar-mini .main-sidebar::before {
            width: 4.6rem;
          }

          /* Show sidebar text on hover */
          body.sidebar-mini .main-sidebar:hover {
            width: 250px;
          }

          /* Hiển thị text navigation khi hover */
          body.sidebar-mini .main-sidebar:hover .nav-sidebar .nav-link p {
            width: auto;
          }

          /* Hiển thị info user panel khi hover */
          body.sidebar-mini .main-sidebar:hover .info:hover {
            display: block !important;
          }

          /* Hiển thị brand text khi hover */
          body.sidebar-mini .main-sidebar:hover .brand-text {
            display: inline-block !important;
          }

          /* Điều chỉnh kích thước hình ảnh user */
          .user-panel .image img {
            width: 2.5rem;
            height: 2.5rem;
            object-fit: cover;
            border-radius: 50%;
            padding-left: 0;
          }
          .brand-link span {
            display: none !important;
          }
        }
      `}</style>

      {/* JS Scripts */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}
