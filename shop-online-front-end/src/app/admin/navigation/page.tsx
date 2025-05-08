"use client";

import { useState, useEffect } from "react";
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
import {
  NavigationService,
  NavigationMenuItem,
} from "@/services/NaviagationService";
import { CategoryService } from "@/services/CategoryService";
import SortableTableRow from "@/components/admin/navigation/SortableTableRow";
import { useNavigation } from "@/contexts/NavigationContext";
import { useToast } from "@/utils/useToast";
import ConfirmModal from "@/components/admin/shared/ConfirmModal";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

export default function NavigationManagement() {
  const { showToast, Toast } = useToast();

  const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>([]);
  interface Category {
    id: number;
    name: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { refreshNavigation, updateMenuItems } = useNavigation();

  // Form state
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<NavigationMenuItem | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    categoryId: "",
    parentId: "",
    isActive: true,
    megaMenu: false,
  });

  // state cho các menu đang được mở rộng
  const [expandedMenuItems, setExpandedMenuItems] = useState<Set<string>>(
    new Set()
  );

  // Thêm state cho modal xác nhận xóa
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null as number | null,
    itemName: "", // Lưu tên để hiển thị trong xác nhận
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

  // Tải danh sách menu và categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [menuData, categoryData] = await Promise.all([
          NavigationService.getAllMenuItems(),
          CategoryService.getAllCategories(),
        ]);

        setMenuItems(menuData);
        setCategories(
          categoryData.map((category) => ({
            ...category,
            id:
              typeof category.id === "string"
                ? parseInt(category.id, 10)
                : category.id,
          }))
        );

        // Mặc định mở rộng tất cả menu cha
        const parentMenuIds = menuData
          .filter((item) => !item.parentId)
          .map((item) => item.id.toString());
        setExpandedMenuItems(new Set(parentMenuIds));

        setError(null);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Xử lý form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formMode === "add") {
        await NavigationService.createMenuItem({
          name: formData.name,
          link: formData.link || null,
          categoryId: formData.categoryId
            ? parseInt(formData.categoryId)
            : null,
          parentId: formData.parentId ? parseInt(formData.parentId) : null,
          order: menuItems.length,
          isActive: formData.isActive,
          megaMenu: formData.megaMenu,
        });
      } else if (formMode === "edit" && editingItem) {
        await NavigationService.updateMenuItem(editingItem.id, {
          name: formData.name,
          link: formData.link,
          categoryId: formData.categoryId
            ? parseInt(formData.categoryId)
            : null,
          parentId: formData.parentId ? parseInt(formData.parentId) : null,
          isActive: formData.isActive,
          megaMenu: formData.megaMenu,
        });
      }

      resetForm();
      // Tải lại danh sách menu
      const menuData = await NavigationService.getAllMenuItems();
      setMenuItems(menuData);
      await refreshNavigation();
    } catch (error) {
      console.error("Lỗi khi lưu menu:", error);
      setError("Không thể lưu menu. Vui lòng thử lại.");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      link: "",
      categoryId: "",
      parentId: "",
      isActive: true,
      megaMenu: false,
    });
    setFormMode("add");
    setEditingItem(null);
  };

  // Edit menu item
  const handleEdit = (item: NavigationMenuItem) => {
    setFormMode("edit");
    setEditingItem(item);
    setFormData({
      name: item.name,
      link: item.link || "",
      categoryId: item.categoryId ? item.categoryId.toString() : "",
      parentId: item.parentId ? item.parentId.toString() : "",
      isActive: item.isActive,
      megaMenu: item.megaMenu,
    });
  };

  // Hàm để mở modal xác nhận xóa
  const handleDeleteRequest = (item: NavigationMenuItem) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: item.id,
      itemName: item.name,
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
      await NavigationService.deleteMenuItem(deleteConfirmation.itemId);
      // Tải lại danh sách menu
      const menuData = await NavigationService.getAllMenuItems();
      setMenuItems(menuData);

      // Cập nhật navbar
      await refreshNavigation();

      // Hiển thị thông báo thành công
      showToast("Xóa mục menu thành công", { type: "success" });
    } catch (error) {
      console.error("Lỗi khi xóa menu:", error);
      setError("Không thể xóa menu. Vui lòng thử lại.");
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

  // Cập nhật hàm handleDragEnd để xử lý kéo thả trong cấu trúc phân cấp
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

    // Không cho phép kéo menu cha thành con của menu khác
    if (!draggedItem.parentId && targetItem.parentId) {
      showToast("Không thể di chuyển menu cha thành menu con", {
        type: "warning",
      });
      return; // Dừng hành động kéo thả
    }

    try {
      setLoading(true);

      // Xác định chỉ số và tạo mảng mới
      const oldIndex = menuItems.findIndex(
        (item) => item.id.toString() === active.id
      );
      const newIndex = menuItems.findIndex(
        (item) => item.id.toString() === over.id
      );
      const updatedItems = arrayMove(menuItems, oldIndex, newIndex);

      // Cập nhật state
      setMenuItems(updatedItems);

      // Cập nhật thứ tự trong database
      const promises = updatedItems.map((item, index) =>
        NavigationService.updateMenuItem(item.id, { order: index })
      );

      await Promise.all(promises);

      // Cập nhật menu trong context
      updateMenuItems(updatedItems);
      await refreshNavigation();

      showToast("Đã thay đổi vị trí menu thành công", { type: "success" });
    } catch (error) {
      console.error("Lỗi khi cập nhật thứ tự:", error);
      showToast("Không thể thay đổi vị trí menu. Vui lòng thử lại.", {
        type: "error",
      });

      // Tải lại menu nếu có lỗi
      const menuData = await NavigationService.getAllMenuItems();
      setMenuItems(menuData);
    } finally {
      setLoading(false);
    }
  };

  // hàm để mở rộng hoặc thu gọn menu con
  const toggleMenuExpansion = (menuId: string) => {
    setExpandedMenuItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
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
    <AdminLayout title="Quản lý Menu Điều hướng">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Quản lý Menu Điều hướng</h1>
            </div>
            <div className="col-sm-6">
              <Breadcrumb
                items={[
                  { label: "Dashboard", href: "/admin" },
                  { label: "Quản lý Menu Điều hướng", active: true },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Form thêm/sửa menu */}
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
                      <label htmlFor="name">Tên menu</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="categoryId">Danh mục liên kết</label>
                      <select
                        className="form-control"
                        id="categoryId"
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryId: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <small className="form-text text-muted">
                        Nếu chọn danh mục, link sẽ tự động tạo
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="link">Đường dẫn tùy chỉnh</label>
                      <input
                        type="text"
                        className="form-control"
                        id="link"
                        value={formData.link}
                        onChange={(e) =>
                          setFormData({ ...formData, link: e.target.value })
                        }
                        placeholder="/duong-dan-tuy-chinh"
                      />
                      <small className="form-text text-muted">
                        Chỉ điền nếu không chọn danh mục liên kết
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
                              !item.parentId && item.id !== editingItem?.id
                          )
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <div className="custom-control custom-switch">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="isActive"
                        >
                          Hiển thị menu
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="custom-control custom-switch">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="megaMenu"
                          checked={formData.megaMenu}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              megaMenu: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="megaMenu"
                        >
                          Megamenu (chỉ cho menu cấp 1)
                        </label>
                      </div>
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
                  <h3 className="card-title">Danh sách Menu Điều hướng</h3>
                </div>
                <div className="card-body table-responsive p-0">
                  {loading ? (
                    <div className="py-4">
                      <LoadingSpinner
                        size="lg"
                        text="Đang tải danh sách menu..."
                      />
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger">{error}</div>
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
                            <th>Tên</th>
                            <th>Link/Danh mục</th>
                            <th>Loại</th>
                            <th>Trạng thái</th>
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
                                    onDelete={handleDeleteRequest} // Thay đổi từ handleDelete thành handleDeleteRequest
                                    onToggleExpand={() =>
                                      toggleMenuExpansion(
                                        parentItem.id.toString()
                                      )
                                    }
                                    isExpanded={expandedMenuItems.has(
                                      parentItem.id.toString()
                                    )}
                                  />

                                  {/* Menu con (hiển thị khi menu cha được mở rộng) */}
                                  {expandedMenuItems.has(
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
                                          onDelete={handleDeleteRequest} // Thay đổi từ handleDelete thành handleDeleteRequest
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
