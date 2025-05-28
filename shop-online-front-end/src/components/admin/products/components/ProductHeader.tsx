"use client";

import React, { memo } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { useProductContext } from "@/contexts/ProductContext";
import ProductValidationAlert from "./ProductValidationAlert";

interface ProductHeaderProps {
  onDelete?: () => void;
  onSave?: () => void;
}

// component ProductHeader dùng để hiển thị tiêu đề và các nút hành động
// cho trang chi tiết sản phẩm
const ProductHeader: React.FC<ProductHeaderProps> = memo(
  ({ onDelete, onSave }) => {
    const { state, dispatch } = useProductContext();
    const { product, isEditing, isSubmitting } = state;

    const getUserRole = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          return user.role; // 1: Admin, 2: Employee, 3: Customer
        }
      } catch {
        return null;
      }
      return null;
    };
    const userRole = getUserRole();

    return (
      <>
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Chi tiết sản phẩm</h1>
              </div>
              <div className="col-sm-6">
                <Breadcrumb
                  items={[
                    { label: "Trang chủ", href: "/admin" },
                    { label: "Sản phẩm", href: "/admin/products" },
                    {
                      label: product
                        ? product.name
                        : state.loading
                        ? "Đang tải..."
                        : "Chi tiết sản phẩm",
                      active: true,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>{" "}
        {isEditing && <ProductValidationAlert product={product} />}
        <div className="mb-3">
          <Link href="/admin/products" className="btn btn-secondary mr-2">
            <i className="fas fa-arrow-left mr-1" /> Quay lại
          </Link>
          {!state.loading && !state.error && product && (
            <>
              {/* nếu là admin === 1 thì hiển thị xóa còn ko thì ko hiện */}
              {userRole === 1 && (
                <button className="btn btn-danger mr-2" onClick={onDelete}>
                  <i className="fas fa-trash mr-1" /> Xóa
                </button>
              )}

              {isEditing ? (
                <>
                  <button
                    className="btn btn-success mr-2"
                    onClick={onSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-1" /> Đang
                        lưu...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-1" /> Lưu thay đổi
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      dispatch({ type: "SET_EDITING", payload: false })
                    }
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    dispatch({ type: "SET_EDITING", payload: true })
                  }
                >
                  <i className="fas fa-edit mr-1" /> Chỉnh sửa
                </button>
              )}
            </>
          )}
        </div>
      </>
    );
  }
);

ProductHeader.displayName = "ProductHeader";

export default ProductHeader;
