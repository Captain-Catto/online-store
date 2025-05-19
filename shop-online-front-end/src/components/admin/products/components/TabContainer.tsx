"use client";

import React, { memo } from "react";
import { useProductContext } from "../context/ProductContext";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

interface TabContainerProps {
  children: React.ReactNode;
}

const TabContainer: React.FC<TabContainerProps> = memo(({ children }) => {
  const { state, dispatch } = useProductContext();
  const { activeTab, loading, error, product } = state;

  const tabs = [
    { id: "info", label: "Chi tiết", icon: "fa-info-circle" },
    { id: "variants", label: "Biến thể", icon: "fa-cubes" },
    { id: "inventory", label: "Tồn kho", icon: "fa-box" },
    { id: "images", label: "Hình ảnh", icon: "fa-images" },
  ];

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <LoadingSpinner />
          <p className="mt-3">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-warning">Không tìm thấy sản phẩm</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-primary card-outline card-tabs">
      <div className="card-header p-0 pt-1 border-bottom-0">
        <ul className="nav nav-tabs" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-item">
              <a
                className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                onClick={() =>
                  dispatch({ type: "SET_ACTIVE_TAB", payload: tab.id })
                }
                href={`#${tab.id}-tab`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <i className={`fas ${tab.icon} mr-1`} /> {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="card-body">
        <div className="tab-content">{children}</div>
      </div>
    </div>
  );
});

TabContainer.displayName = "TabContainer";

export default TabContainer;
