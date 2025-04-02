"use client";
import { ReactNode, useState } from "react";
import Head from "next/head";
import Script from "next/script";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({
  children,
  title = "Admin Dashboard",
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMenu = (menuPath: string) => {
    setOpenMenus((prev) => {
      if (prev.includes(menuPath)) {
        return prev.filter((path) => path !== menuPath);
      } else {
        return [...prev, menuPath];
      }
    });
  };

  return (
    <>
      <Head>
        <title>{title} - Shop Online</title>
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

      <div className={`wrapper ${sidebarCollapsed ? "sidebar-collapse" : ""}`}>
        <AdminNavbar toggleSidebar={toggleSidebar} />
        <AdminSidebar openMenus={openMenus} toggleMenu={toggleMenu} />

        {/* Content Wrapper */}
        <div className="content-wrapper">{children}</div>

        <AdminFooter />
      </div>

      {/* JS Scripts */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}
