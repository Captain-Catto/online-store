"use client";

import { useState, useEffect, useCallback } from "react";
import React from "react";
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
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import { AdminMenuService } from "@/services/AdminMenuService";
import { MenuItemData } from "@/hooks/useAdminMenu";
import SortableTableRow from "@/components/admin/settings/SortableMenuRow";
import { useToast } from "@/utils/useToast";
import ConfirmModal from "@/components/admin/shared/ConfirmModal";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

export default function AdminMenuManagement() {
  const { showToast, Toast } = useToast();

  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form state
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    path: "",
    icon: "",
    parentId: "",
    displayOrder: 0,
  });

  // State để theo dõi các menu đang được mở rộng
  const [expandedMenuIds, setExpandedMenuIds] = useState<Set<string>>(
    new Set()
  );

  // State để theo dõi xác nhận xóa
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null as number | null,
    itemName: "", // tên mục menu để hiển thị trong modal
  });

  // Cấu hình sensors cho drag and drop
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

  // Load menu items từ API
  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminMenuService.getAllMenuItems();
      setMenuItems(data);

      // Mặc định mở rộng tất cả menu cha
      const parentMenuIds = data
        .filter((item) => !item.parentId)
        .map((item) => item.id.toString());
      setExpandedMenuIds(new Set(parentMenuIds));

      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải menu:", err);
      setError("Không thể tải danh sách menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  // Xử lý form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        title: formData.title,
        path: formData.path,
        icon: formData.icon,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        displayOrder: formData.displayOrder,
      };

      if (formMode === "add") {
        await AdminMenuService.createMenuItem(submitData);
        showToast("Thêm menu thành công!", { type: "success" });
      } else if (formMode === "edit" && editingItem) {
        await AdminMenuService.updateMenuItem(editingItem.id, submitData);
        showToast("Cập nhật menu thành công!", { type: "success" });
      }

      resetForm();
      await loadMenuItems();
    } catch (err) {
      console.error("Lỗi khi lưu menu:", err);
      showToast("Lỗi khi lưu mục menu", { type: "error" });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      path: "",
      icon: "",
      parentId: "",
      displayOrder: 0,
    });
    setFormMode("add");
    setEditingItem(null);
  };

  // Edit menu item
  const handleEdit = (item: MenuItemData) => {
    setFormMode("edit");
    setEditingItem(item);
    setFormData({
      title: item.title,
      path: item.path,
      icon: item.icon,
      parentId: item.parentId ? item.parentId.toString() : "",
      displayOrder: item.displayOrder,
    });
  };

  // Toggle mở/đóng các menu con
  const toggleMenuExpansion = (menuId: string) => {
    setExpandedMenuIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  // Hàm để mở modal xác nhận xóa
  const handleDeleteRequest = (item: MenuItemData) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: item.id,
      itemName: item.title,
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
      await AdminMenuService.deleteMenuItem(deleteConfirmation.itemId);
      showToast("Xóa mục menu thành công!", { type: "success" });
      await loadMenuItems();
    } catch (err) {
      console.error("Lỗi khi xóa menu:", err);
      showToast("Không thể xóa menu", { type: "error" });
    } finally {
      // Đóng modal sau khi hoàn tất
      handleCancelDelete();
    }
  };

  // Xử lý khi bắt đầu kéo
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  // Xử lý khi kéo thả hoàn tất
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Tìm các item liên quan
    const draggedItem = menuItems.find(
      (item) => item.id.toString() === active.id
    );
    const targetItem = menuItems.find((item) => item.id.toString() === over.id);

    if (!draggedItem || !targetItem) return;

    try {
      setLoading(true);

      // Xác định index mới cho các item
      const oldIndex = menuItems.findIndex(
        (item) => item.id === draggedItem.id
      );
      const newIndex = menuItems.findIndex((item) => item.id === targetItem.id);

      // Tạo mảng mới với thứ tự đã được thay đổi
      const newItems = arrayMove(menuItems, oldIndex, newIndex);

      // Cập nhật displayOrder cho các phần tử
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        displayOrder: index + 1,
      }));

      setMenuItems(updatedItems);

      // Gọi API để cập nhật thứ tự trên server
      await AdminMenuService.updateMenuOrder(
        updatedItems.map((item) => ({
          id: item.id,
          displayOrder: item.displayOrder,
        }))
      );

      showToast("Đã cập nhật thứ tự menu", { type: "success" });
    } catch (error) {
      console.error("Lỗi khi cập nhật thứ tự:", error);
      showToast("Không thể cập nhật thứ tự menu", { type: "error" });
      // Load lại dữ liệu nếu có lỗi
      await loadMenuItems();
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách menu cha (root menu items)
  const getParentMenuItems = () => {
    return menuItems.filter((item) => !item.parentId);
  };

  // Hàm lấy danh sách menu con theo parentId
  const getChildMenuItems = (parentId: number) => {
    return menuItems.filter((item) => item.parentId === parentId);
  };

  return (
    <AdminLayout title="Quản lý Menu Sidebar">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Quản lý Menu Sidebar</h1>
            </div>
            <div className="col-sm-6">
              <Breadcrumb
                items={[
                  { label: "Dashboard", href: "/admin" },
                  { label: "Cài đặt" },
                  { label: "Menu Sidebar", active: true },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Form thêm/sửa menu - Giống như trong navigation */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    {formMode === "add" ? "Thêm" : "Sửa"} Menu
                  </h3>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="card-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="form-group">
                      <label htmlFor="title">Tiêu đề *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="path">Đường dẫn *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="path"
                        value={formData.path}
                        onChange={(e) =>
                          setFormData({ ...formData, path: e.target.value })
                        }
                        required
                        placeholder="Ví dụ: products hoặc #"
                      />
                      <small className="form-text text-muted">
                        Nhập đường dẫn tương đối (không cần &apos;/admin&apos;).
                        Sử dụng &apos;#&apos; cho menu không có link trực tiếp.
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="icon">Icon *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="icon"
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData({ ...formData, icon: e.target.value })
                        }
                        required
                        placeholder="Ví dụ: fas fa-users"
                      />
                      <small className="form-text text-muted">
                        Sử dụng class của Font Awesome
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="parentId">Menu cha</label>
                      <select
                        className="form-control"
                        id="parentId"
                        value={formData.parentId}
                        onChange={(e) =>
                          setFormData({ ...formData, parentId: e.target.value })
                        }
                      >
                        <option value="">-- Menu gốc --</option>
                        {menuItems
                          .filter(
                            (item) =>
                              !item.parentId &&
                              (!editingItem || item.id !== editingItem.id)
                          )
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.title}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="displayOrder">Thứ tự hiển thị</label>
                      <input
                        type="number"
                        className="form-control"
                        id="displayOrder"
                        value={formData.displayOrder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            displayOrder: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="card-footer">
                    <button type="submit" className="btn btn-primary">
                      {formMode === "add" ? "Thêm menu" : "Cập nhật"}
                    </button>
                    {formMode === "edit" && (
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

            {/* Danh sách menu */}
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Danh sách Menu Sidebar</h3>
                </div>
                <div className="card-body table-responsive p-0">
                  {loading ? (
                    <div className="text-center my-3">
                      <LoadingSpinner
                        size="lg"
                        text="Đang tải danh sách menu..."
                      />
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
                            <th style={{ width: "50px" }}>#</th>
                            <th>Tiêu đề</th>
                            <th>Đường dẫn</th>
                            <th>Icon</th>
                            <th>Thứ tự</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <SortableContext
                          items={menuItems.map((item) => item.id.toString())}
                          strategy={verticalListSortingStrategy}
                        >
                          <tbody>
                            {loading ? (
                              <tr>
                                <td colSpan={6} className="text-center">
                                  Đang tải...
                                </td>
                              </tr>
                            ) : menuItems.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center">
                                  Không có dữ liệu
                                </td>
                              </tr>
                            ) : (
                              // Hiển thị các menu cha và menu con (tương tự như Navigation)
                              getParentMenuItems().map((parentItem) => (
                                <React.Fragment key={parentItem.id}>
                                  {/* Menu cha */}
                                  <SortableTableRow
                                    item={parentItem}
                                    isParentItem={true}
                                    isActive={
                                      activeId === parentItem.id.toString()
                                    }
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteRequest}
                                    onToggleExpand={() =>
                                      toggleMenuExpansion(
                                        parentItem.id.toString()
                                      )
                                    }
                                    isExpanded={expandedMenuIds.has(
                                      parentItem.id.toString()
                                    )}
                                  />

                                  {/* Menu con (hiển thị khi menu cha được mở rộng) */}
                                  {expandedMenuIds.has(
                                    parentItem.id.toString()
                                  ) &&
                                    getChildMenuItems(parentItem.id).map(
                                      (childItem) => (
                                        <SortableTableRow
                                          key={childItem.id}
                                          item={childItem}
                                          isParentItem={false}
                                          isActive={
                                            activeId === childItem.id.toString()
                                          }
                                          onEdit={handleEdit}
                                          onDelete={handleDeleteRequest}
                                          isChild={true}
                                        />
                                      )
                                    )}
                                </React.Fragment>
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
        message={`Bạn có chắc chắn muốn xóa menu "${deleteConfirmation.itemName}"?`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmButtonClass="btn-danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      {/* Toast notifications */}
      {Toast}
    </AdminLayout>
  );
}
