"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { useToast } from "@/utils/useToast";
import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "@/services/AuthClient";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

interface Suitability {
  id: number;
  name: string;
  description: string;
  sortOrder: number;
}

export default function SuitabilitiesManagement() {
  const { showToast, Toast } = useToast();
  const [suitabilities, setSuitabilities] = useState<Suitability[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // thêm state xử lý drag end
  const [reordering, setReordering] = useState(false);

  // Breadcrumb
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Quản lý phù hợp sản phẩm", active: true },
  ];

  // Load suitabilities
  useEffect(() => {
    fetchSuitabilities();
  }, []);

  const fetchSuitabilities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/suitabilities`);
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu");
      }
      const data = await response.json();
      setSuitabilities(data);
    } catch (error) {
      console.error("Error loading suitabilities:", error);
      showToast("Lỗi khi tải danh sách phù hợp", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Vui lòng nhập tên", { type: "error" });
      return;
    }

    try {
      setSubmitting(true);

      if (isEditing && editingId) {
        // Cập nhật
        const response = await AuthClient.fetchWithAuth(
          `${API_BASE_URL}/suitabilities/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Lỗi khi cập nhật");
        }

        showToast("Cập nhật thành công", { type: "success" });
      } else {
        // Tạo mới
        const response = await AuthClient.fetchWithAuth(
          `${API_BASE_URL}/suitabilities`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Lỗi khi thêm mới");
        }

        showToast("Thêm mới thành công", { type: "success" });
      }

      // Làm mới dữ liệu và reset form
      fetchSuitabilities();
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast(error instanceof Error ? error.message : "Có lỗi xảy ra", {
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (suitability: Suitability) => {
    setFormData({
      name: suitability.name,
      description: suitability.description || "",
    });
    setIsEditing(true);
    setEditingId(suitability.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) {
      return;
    }

    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/suitabilities/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi xóa");
      }

      showToast("Xóa thành công", { type: "success" });
      fetchSuitabilities();
    } catch (error) {
      console.error("Error deleting:", error);
      showToast(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa",
        {
          type: "error",
        }
      );
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  // Hàm xử lý khi kéo thả hoàn tất
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    // Sắp xếp lại mảng
    const items = Array.from(suitabilities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Cập nhật lại sortOrder
    const updatedItems = items.map((item, index) => ({
      ...item,
      sortOrder: index * 10, // Nhảy mỗi 10 để dễ chèn giữa nếu cần
    }));

    // Cập nhật state UI trước
    setSuitabilities(updatedItems);

    // Gửi cập nhật lên server
    try {
      setReordering(true);
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/suitabilities/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: updatedItems.map((item) => ({
              id: item.id,
              sortOrder: item.sortOrder,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi cập nhật thứ tự");
      }

      showToast("Cập nhật thứ tự thành công", { type: "success" });
    } catch (error) {
      console.error("Error reordering:", error);
      showToast(
        error instanceof Error ? error.message : "Lỗi khi cập nhật thứ tự",
        {
          type: "error",
        }
      );
      // Lấy lại dữ liệu nếu có lỗi
      fetchSuitabilities();
    } finally {
      setReordering(false);
    }
  };

  return (
    <AdminLayout title="Quản lý phù hợp sản phẩm">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Quản lý phù hợp sản phẩm</h1>
            </div>
            <div className="col-sm-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Form */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    {isEditing ? "Chỉnh sửa" : "Thêm mới"}
                  </h3>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="name">Tên Phù Hợp</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        placeholder="VD: Thể thao, Đi chơi, ..."
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Mô tả (tùy chọn)</label>
                      <textarea
                        className="form-control"
                        id="description"
                        rows={3}
                        placeholder="Mô tả chi tiết..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm mr-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          {isEditing ? "Đang cập nhật..." : "Đang thêm..."}
                        </>
                      ) : isEditing ? (
                        "Cập nhật"
                      ) : (
                        "Thêm mới"
                      )}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        className="btn btn-default ml-2"
                        onClick={resetForm}
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* List */}
            {/* List */}
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Danh sách phù hợp</h3>
                  <div className="card-tools">
                    {reordering && (
                      <span className="badge badge-info">
                        <i className="fas fa-sync fa-spin mr-1"></i> Đang cập
                        nhật...
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-body p-0">
                  {loading ? (
                    <div className="text-center p-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="sr-only">Đang tải...</span>
                      </div>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable
                        droppableId="suitabilities"
                        isDropDisabled={false}
                      >
                        {(provided) => (
                          <table
                            className="table table-hover"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            <thead>
                              <tr>
                                <th style={{ width: "10px" }}></th>
                                <th style={{ width: "10%" }}>#</th>
                                <th>Tên</th>
                                <th>Mô tả</th>
                                <th style={{ width: "20%" }}>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {suitabilities.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-4">
                                    Không có dữ liệu
                                  </td>
                                </tr>
                              ) : (
                                suitabilities.map((item, index) => (
                                  <Draggable
                                    key={item.id.toString()}
                                    draggableId={item.id.toString()}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <tr
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={
                                          snapshot.isDragging ? "bg-light" : ""
                                        }
                                      >
                                        <td
                                          {...provided.dragHandleProps}
                                          className="text-center"
                                        >
                                          <i className="fas fa-grip-lines"></i>
                                        </td>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>
                                          {item.description || "Không có mô tả"}
                                        </td>
                                        <td>
                                          <button
                                            className="btn btn-sm btn-info mr-1"
                                            onClick={() => handleEdit(item)}
                                          >
                                            <i className="fas fa-edit"></i> Sửa
                                          </button>
                                          <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() =>
                                              handleDelete(item.id)
                                            }
                                          >
                                            <i className="fas fa-trash"></i> Xóa
                                          </button>
                                        </td>
                                      </tr>
                                    )}
                                  </Draggable>
                                ))
                              )}
                              {provided.placeholder}
                            </tbody>
                          </table>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {Toast}
    </AdminLayout>
  );
}
