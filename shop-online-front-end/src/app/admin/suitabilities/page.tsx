"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { useToast } from "@/utils/useToast";
import { API_BASE_URL } from "@/config/apiConfig";
import { AuthClient } from "@/services/AuthClient";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableSuitabilityRow from "@/components/admin/suitability/SortableSuitabilityRow";
import ConfirmModal from "@/components/admin/shared/ConfirmModal";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

// Định nghĩa interface cho đối tượng Suitability
interface Suitability {
  id: number;
  name: string;
  description: string;
  slug: string;
  sortOrder: number;
}

export default function SuitabilitiesManagement() {
  const { showToast, Toast } = useToast();
  const [suitabilities, setSuitabilities] = useState<Suitability[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    slug: string;
  }>({
    name: "",
    description: "",
    slug: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Thêm state để xử lý kéo thả
  const [reordering, setReordering] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // State để theo dõi xác nhận xóa
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null as number | null,
    itemName: "",
  });

  const slugify = (text: string): string => {
    // Chuyển thành chữ thường
    let slug = text.toLowerCase();

    // Chuyển đổi Unicode tiếng Việt thành ASCII
    slug = slug
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d");

    // Xóa ký tự đặc biệt và thay thế khoảng trắng bằng dấu gạch ngang
    slug = slug
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    return slug;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Kích hoạt drag sau khi di chuyển 5px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Xử lý bắt đầu kéo
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };
  // Breadcrumb
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Quản lý phù hợp sản phẩm", active: true },
  ];

  const fetchSuitabilities = React.useCallback(async () => {
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
  }, [showToast]);

  // Sử dụng fetchSuitabilities trong useEffect
  useEffect(() => {
    fetchSuitabilities();
  }, [fetchSuitabilities]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: slugify(name), // Tự động tạo slug khi tên thay đổi
    });
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

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Lỗi khi cập nhật");
        }

        showToast("Cập nhật thành công", { type: "success" });
        resetForm();
        fetchSuitabilities();
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

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Lỗi khi thêm mới");
        }

        showToast("Thêm mới thành công", { type: "success" });
        resetForm();
        fetchSuitabilities();
      }
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
      slug: suitability.slug,
    });
    setIsEditing(true);
    setEditingId(suitability.id);
  };

  // Hàm để mở modal xác nhận xóa
  const handleDeleteRequest = (suitability: Suitability) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: suitability.id,
      itemName: suitability.name,
    });
  };

  // Hàm để đóng modal
  const handleCancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null,
      itemName: "",
    });
  };

  // Hàm thực hiện xóa sau khi đã xác nhận
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.itemId) return;

    try {
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/suitabilities/${deleteConfirmation.itemId}`,
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
    } finally {
      // Đóng modal sau khi hoàn tất
      handleCancelDelete();
      // Làm mới danh sách sau khi xóa
      fetchSuitabilities();
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", slug: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  // Hàm xử lý khi kéo thả hoàn tất
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Tìm index của các item trong mảng
    const oldIndex = suitabilities.findIndex(
      (item) => item.id.toString() === active.id
    );
    const newIndex = suitabilities.findIndex(
      (item) => item.id.toString() === over.id
    );

    // Cập nhật mảng theo thứ tự mới
    const updatedItems = arrayMove(suitabilities, oldIndex, newIndex);

    // Cập nhật state
    setSuitabilities(updatedItems);

    // Gửi cập nhật lên server
    try {
      setReordering(true);
      console.log("Reordering items:", updatedItems);
      const response = await AuthClient.fetchWithAuth(
        `${API_BASE_URL}/suitabilities/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: updatedItems.map((item, index) => ({
              id: item.id,
              sortOrder: index * 10,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi cập nhật thứ tự");
      }

      showToast("Cập nhật thứ tự thành công", { type: "success" });
      fetchSuitabilities();
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
                      <label htmlFor="name">Tên</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        placeholder="VD: Thể thao, Đi chơi, ..."
                        value={formData.name}
                        onChange={(e) => handleNameChange(e)}
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
                    <div className="form-group">
                      <label htmlFor="slug">Slug (tự tạo)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="slug"
                        placeholder="VD: the-thao, di-choi, ..."
                        value={formData.slug}
                        disabled
                      />
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
                      <LoadingSpinner size="lg" text="Đang tải danh sách..." />
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th style={{ width: "10px" }}></th>
                            <th style={{ width: "10%" }}>#</th>
                            <th>Tên</th>
                            <th>Mô tả</th>
                            <th>Slug</th>
                            <th style={{ width: "20%" }}>Thao tác</th>
                          </tr>
                        </thead>
                        <SortableContext
                          items={suitabilities.map((item) =>
                            item.id.toString()
                          )}
                          strategy={verticalListSortingStrategy}
                        >
                          <tbody>
                            {suitabilities.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-4">
                                  Không có dữ liệu
                                </td>
                              </tr>
                            ) : (
                              suitabilities.map((item) => (
                                <SortableSuitabilityRow
                                  key={item.id}
                                  item={item}
                                  isActive={activeId === item.id.toString()}
                                  onEdit={handleEdit}
                                  onDelete={handleDeleteRequest}
                                />
                              ))
                            )}
                          </tbody>
                        </SortableContext>
                      </table>
                    </DndContext>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ConfirmModal
        isOpen={deleteConfirmation.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa "${deleteConfirmation.itemName}"?`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmButtonClass="btn-danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      {Toast}
    </AdminLayout>
  );
}
