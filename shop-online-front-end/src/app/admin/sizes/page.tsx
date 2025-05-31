"use client";

import React, { useEffect } from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import SizeManager from "@/components/admin/settings/SizeManager";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";

export default function SizesPage() {
  const router = useRouter();
  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push("/login");
    }
  }, [router]);

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Cài đặt", href: "/admin/settings" },
    { label: "Quản lý kích thước", href: "#" },
  ];

  return (
    <AdminLayout title="Quản lý kích thước">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Quản lý kích thước sản phẩm</h1>
            </div>
            <div className="col-sm-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <SizeManager />
        </div>
      </section>
    </AdminLayout>
  );
}
