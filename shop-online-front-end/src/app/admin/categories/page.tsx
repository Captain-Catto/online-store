"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/utils/useToast";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { CategoryService } from "@/services/CategoryService";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";
import Image from "next/image";
import ConfirmModal from "@/components/admin/shared/ConfirmModal";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

// Define interfaces outside the component
interface Category {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  parentId?: string | number | null;
  isActive: boolean;
  children?: Category[];
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: File | null;
  imageUrl: string;
  parentId: string | number | null;
  isActive: boolean;
}

export default function CategoriesManagement() {
  const { showToast, Toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // State để theo dõi danh mục nào đang được mở rộng
  const [expandedCategories, setExpandedCategories] = useState<
    Set<string | number>
  >(new Set());

  // States for form handling
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image: null,
    imageUrl: "",
    parentId: null,
    isActive: true,
  });

  // States for child category form
  const [showChildForm, setShowChildForm] = useState<boolean>(false);
  const [childFormData, setChildFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image: null,
    imageUrl: "",
    parentId: "",
    isActive: true,
  });

  const [pendingChildCategories, setPendingChildCategories] = useState<
    CategoryFormData[]
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const childFileInputRef = useRef<HTMLInputElement>(null);

  // State để theo dõi xác nhận xóa
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null as string | number | null,
    itemName: "", // Lưu tên để hiển thị trong xác nhận
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await CategoryService.getAllCategories();

        // Nếu dữ liệu trả về có cấu trúc phân cấp, cần phẳng hóa
        const flattenedData = flattenCategories(data);
        setCategories(flattenedData);
        setLoading(false);

        // Mặc định mở tất cả danh mục cha
        const parentIds = flattenedData
          .filter((category) => category.parentId === null)
          .map((category) => category.id);
        setExpandedCategories(new Set(parentIds));
      } catch (error) {
        showToast(error as string, { type: "error" });
        setLoading(false);
      }
    };

    fetchCategories();
  }, [showToast]);

  // Hàm làm phẳng dữ liệu danh mục phân cấp (cải tiến với đệ quy)
  const flattenCategories = (nestedCategories: Category[]): Category[] => {
    const result: Category[] = [];

    // Hàm đệ quy để duyệt qua tất cả các cấp danh mục
    const flatten = (categories: Category[]): void => {
      for (const category of categories) {
        // Tạo bản sao của danh mục hiện tại (không bao gồm children)
        const { children, ...categoryWithoutChildren } = category;

        // Thêm danh mục hiện tại vào kết quả
        result.push({
          ...categoryWithoutChildren,
          children: undefined, // Đảm bảo không có children trong kết quả
        } as Category);

        // Nếu có danh mục con, đệ quy để làm phẳng chúng
        if (children && Array.isArray(children) && children.length > 0) {
          flatten(children);
        }
      }
    };

    // Bắt đầu quá trình làm phẳng
    flatten(nestedCategories);
    return result;
  };

  // Hàm để bật/tắt hiển thị danh mục con
  const toggleCategoryExpansion = (categoryId: string | number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Phân loại danh mục thành cha và con
  const getParentCategories = (): Category[] => {
    return categories.filter((category) => category.parentId === null);
  };

  const getChildCategories = (parentId: string | number): Category[] => {
    return categories.filter((category) => category.parentId === parentId);
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredParentCategories = getParentCategories().filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input changes for main category
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "name" && !editingCategory) {
      // Auto-generate slug when name changes (only when adding new category)
      const newSlug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");

      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: newSlug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload for main category
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  // Handle form input changes for child category
  const handleChildInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setChildFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "name") {
      // Auto-generate slug for child category
      const newSlug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");

      setChildFormData((prev) => ({
        ...prev,
        name: value,
        slug: newSlug,
      }));
    } else {
      setChildFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload for child category
  const handleChildImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setChildFormData((prev) => ({
        ...prev,
        image: file,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  // Add a child category to pending list
  const handleAddPendingChildCategory = () => {
    if (!childFormData.name) {
      showToast("Vui lòng nhập tên danh mục con", { type: "error" });
      return;
    }

    setPendingChildCategories((prev) => [...prev, { ...childFormData }]);

    // Reset child form data
    setChildFormData({
      name: "",
      slug: "",
      description: "",
      image: null,
      imageUrl: "",
      parentId: "",
      isActive: true,
    });

    // Reset file input
    if (childFileInputRef.current) {
      childFileInputRef.current.value = "";
    }

    showToast("Đã thêm danh mục con vào danh sách chờ", { type: "success" });
  };

  // Remove child category from pending list
  const handleRemovePendingChildCategory = (index: number) => {
    setPendingChildCategories((prev) => prev.filter((_, i) => i !== index));
  };

  // Main form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let parentCategoryId: string = "";

      // 1. Tạo hoặc cập nhật danh mục chính
      if (editingCategory) {
        // Update existing category
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("slug", formData.slug);
        formDataToSend.append("description", formData.description || "");

        if (formData.parentId) {
          formDataToSend.append("parentId", String(formData.parentId));
        }

        formDataToSend.append("isActive", formData.isActive ? "true" : "false");

        if (formData.image) {
          formDataToSend.append("image", formData.image);
        }

        await CategoryService.updateCategory(
          editingCategory.id,
          formDataToSend
        );
        showToast("Cập nhật danh mục thành công", { type: "success" });
        parentCategoryId = String(editingCategory.id);
      } else {
        // Create new category
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("slug", formData.slug);
        formDataToSend.append("description", formData.description || "");

        if (formData.parentId) {
          formDataToSend.append("parentId", String(formData.parentId));
        }

        formDataToSend.append("isActive", formData.isActive ? "true" : "false");

        if (formData.image) {
          formDataToSend.append("image", formData.image);
        }

        const newCategory = await CategoryService.createCategory(
          formDataToSend
        );
        showToast("Thêm danh mục thành công", { type: "success" });
        parentCategoryId = String(newCategory.id);
      }

      // 2. Tạo các danh mục con nếu có
      if (pendingChildCategories.length > 0) {
        for (const childCategory of pendingChildCategories) {
          const childFormDataToSend = new FormData();
          childFormDataToSend.append("name", childCategory.name);
          childFormDataToSend.append("slug", childCategory.slug);
          childFormDataToSend.append(
            "description",
            childCategory.description || ""
          );
          childFormDataToSend.append("parentId", parentCategoryId);
          childFormDataToSend.append(
            "isActive",
            childCategory.isActive ? "true" : "false"
          );

          if (childCategory.image) {
            childFormDataToSend.append("image", childCategory.image);
          }

          await CategoryService.createCategory(childFormDataToSend);
        }

        showToast(
          `Đã thêm ${pendingChildCategories.length} danh mục con thành công`,
          { type: "success" }
        );
      }

      // Reset forms and fetch updated data
      resetForm();
      const data = await CategoryService.getAllCategories();
      const flattenedData = flattenCategories(data);
      setCategories(flattenedData);
    } catch (error) {
      showToast(error as string, { type: "error" });
    }
  };

  // Handler to edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: null,
      imageUrl: category.image || "",
      parentId: category.parentId || null,
      isActive: category.isActive,
    });
    setShowForm(true);
    // Clear pending child categories when editing
    setPendingChildCategories([]);
    setShowChildForm(false);
  };

  // Reset all forms
  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: null,
      imageUrl: "",
      parentId: null,
      isActive: true,
    });
    setShowForm(false);
    setShowChildForm(false);
    setPendingChildCategories([]);
    setChildFormData({
      name: "",
      slug: "",
      description: "",
      image: null,
      imageUrl: "",
      parentId: "",
      isActive: true,
    });

    // Reset file inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (childFileInputRef.current) {
      childFileInputRef.current.value = "";
    }
  };

  // Helper function to get absolute URL for images
  const getAbsoluteImageUrl = (relativePath?: string | null): string => {
    if (!relativePath) return "";

    // If it's already an absolute URL
    if (
      relativePath.startsWith("http://") ||
      relativePath.startsWith("https://")
    ) {
      return relativePath;
    }

    // Otherwise, prepend base URL
    return `${process.env.NEXT_PUBLIC_API_URL || ""}${relativePath}`;
  };

  // Handler để mở modal xác nhận xóa
  const handleDeleteRequest = (category: Category) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: category.id,
      itemName: category.name,
    });
  };

  // Handler để đóng modal
  const handleCancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null,
      itemName: "",
    });
  };

  // Handler thực hiện xóa
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.itemId) return;

    try {
      await CategoryService.deleteCategory(deleteConfirmation.itemId);
      showToast("Xóa danh mục thành công", { type: "success" });
      const data = await CategoryService.getAllCategories();
      const flattenedData = flattenCategories(data);
      setCategories(flattenedData);
    } catch (error) {
      showToast(error as string, { type: "error" });
    } finally {
      // Đóng modal sau khi hoàn tất
      handleCancelDelete();
    }
  };

  return (
    <AdminLayout title="Quản lý danh mục sản phẩm">
      {/* Content Header */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Quản lý danh mục sản phẩm</h1>
            </div>
            <div className="col-sm-6">
              <Breadcrumb
                items={[
                  { label: "Trang chủ", href: "/admin" },
                  { label: "Danh mục sản phẩm" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Form */}
            <div className="col-md-4">
              {showForm ? (
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      {editingCategory
                        ? "Chỉnh sửa danh mục"
                        : "Thêm danh mục mới"}
                    </h3>
                    <div className="card-tools">
                      <button
                        type="button"
                        className="btn btn-tool"
                        onClick={resetForm}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      {/* Danh mục cha */}
                      <div className="form-group">
                        <label htmlFor="parentId">Danh mục cha</label>
                        <select
                          className="form-control"
                          id="parentId"
                          name="parentId"
                          value={formData.parentId?.toString() || ""}
                          onChange={handleInputChange}
                        >
                          <option value="">
                            -- Không có (Danh mục gốc) --
                          </option>
                          {categories
                            .filter((cat) => cat.parentId === null)
                            .map((category) => (
                              <option
                                key={category.id}
                                value={category.id.toString()}
                                disabled={editingCategory?.id === category.id}
                              >
                                {category.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Tên danh mục */}
                      <div className="form-group">
                        <label htmlFor="name">
                          Tên danh mục <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nhập tên danh mục"
                          required
                        />
                      </div>

                      {/* Slug */}
                      <div className="form-group">
                        <label htmlFor="slug">
                          Slug <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="slug"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          placeholder="ten-danh-muc"
                          required
                        />
                        <small className="form-text text-muted">
                          Định dạng URL thân thiện
                        </small>
                      </div>

                      {/* Mô tả */}
                      <div className="form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Nhập mô tả danh mục"
                        />
                      </div>

                      {/* Hình ảnh */}
                      <div className="form-group">
                        <label htmlFor="image">Hình ảnh</label>
                        <div className="input-group">
                          <div className="custom-file">
                            <input
                              type="file"
                              className="custom-file-input"
                              id="image"
                              name="image"
                              onChange={handleImageChange}
                              ref={fileInputRef}
                              accept=".jpg,.jpeg,.png,.gif"
                            />
                            <label
                              className="custom-file-label"
                              htmlFor="image"
                            >
                              {formData.image
                                ? formData.image.name
                                : "Chọn hình ảnh"}
                            </label>
                          </div>
                        </div>
                        {formData.imageUrl && (
                          <div className="mt-2">
                            <Image
                              src={formData.imageUrl}
                              alt="Category preview"
                              width={100}
                              height={100}
                              className="img-thumbnail"
                              style={{ objectFit: "cover" }}
                            />
                            {editingCategory && editingCategory.image && (
                              <div className="mt-1">
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={getAbsoluteImageUrl(
                                      editingCategory.image
                                    )}
                                    readOnly
                                  />
                                  <div className="input-group-append">
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      type="button"
                                      onClick={() => {
                                        if (editingCategory.image) {
                                          navigator.clipboard.writeText(
                                            getAbsoluteImageUrl(
                                              editingCategory.image
                                            )
                                          );
                                          showToast(
                                            "Đã sao chép link hình ảnh",
                                            { type: "success" }
                                          );
                                        }
                                      }}
                                    >
                                      <i className="fas fa-copy"></i>
                                    </button>
                                    {editingCategory.image && (
                                      <a
                                        className="btn btn-sm btn-outline-info"
                                        href={getAbsoluteImageUrl(
                                          editingCategory.image
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <i className="fas fa-external-link-alt"></i>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Trạng thái */}
                      <div className="form-group">
                        <div className="custom-control custom-switch">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="isActive"
                          >
                            Kích hoạt
                          </label>
                        </div>
                      </div>

                      {/* Button để hiển thị form con */}
                      {!formData.parentId && !editingCategory && (
                        <div className="form-group mt-4">
                          <button
                            type="button"
                            className="btn btn-outline-info"
                            onClick={() => setShowChildForm(!showChildForm)}
                          >
                            <i
                              className={`fas fa-${
                                showChildForm ? "minus" : "plus"
                              } mr-1`}
                            ></i>
                            {showChildForm
                              ? "Ẩn form danh mục con"
                              : "Thêm danh mục con cùng lúc"}
                          </button>
                        </div>
                      )}

                      {/* Danh sách các danh mục con đang chờ */}
                      {pendingChildCategories.length > 0 && (
                        <div className="form-group mt-3">
                          <label>Danh mục con sẽ được tạo:</label>
                          <ul className="list-group">
                            {pendingChildCategories.map((child, index) => (
                              <li
                                key={index}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                {child.name}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() =>
                                    handleRemovePendingChildCategory(index)
                                  }
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Submit buttons */}
                      <div className="form-group">
                        <button type="submit" className="btn btn-primary">
                          {editingCategory ? "Cập nhật" : "Thêm mới"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-default ml-2"
                          onClick={resetForm}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-body">
                    <button
                      onClick={() => setShowForm(true)}
                      className="btn btn-primary btn-lg btn-block"
                    >
                      <i className="fas fa-plus mr-1"></i> Thêm danh mục mới
                    </button>
                  </div>
                </div>
              )}

              {/* Form danh mục con */}
              {showForm &&
                showChildForm &&
                !formData.parentId &&
                !editingCategory && (
                  <div className="card mt-4">
                    <div className="card-header">
                      <h3 className="card-title">Thêm danh mục con</h3>
                    </div>
                    <div className="card-body">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddPendingChildCategory();
                        }}
                      >
                        {/* Tên danh mục con */}
                        <div className="form-group">
                          <label htmlFor="childName">
                            Tên danh mục con{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="childName"
                            name="name"
                            value={childFormData.name}
                            onChange={handleChildInputChange}
                            placeholder="Nhập tên danh mục con"
                            required
                          />
                        </div>

                        {/* Slug con */}
                        <div className="form-group">
                          <label htmlFor="childSlug">
                            Slug <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="childSlug"
                            name="slug"
                            value={childFormData.slug}
                            onChange={handleChildInputChange}
                            placeholder="ten-danh-muc-con"
                            required
                          />
                        </div>

                        {/* Mô tả con */}
                        <div className="form-group">
                          <label htmlFor="childDescription">Mô tả</label>
                          <textarea
                            className="form-control"
                            id="childDescription"
                            name="description"
                            rows={2}
                            value={childFormData.description}
                            onChange={handleChildInputChange}
                            placeholder="Nhập mô tả danh mục con"
                          />
                        </div>

                        {/* Hình ảnh con */}
                        <div className="form-group">
                          <label htmlFor="childImage">Hình ảnh</label>
                          <div className="input-group">
                            <div className="custom-file">
                              <input
                                type="file"
                                className="custom-file-input"
                                id="childImage"
                                name="image"
                                onChange={handleChildImageChange}
                                ref={childFileInputRef}
                                accept=".jpg,.jpeg,.png,.gif"
                              />
                              <label
                                className="custom-file-label"
                                htmlFor="childImage"
                              >
                                {childFormData.image
                                  ? childFormData.image.name
                                  : "Chọn hình ảnh"}
                              </label>
                            </div>
                          </div>
                          {childFormData.imageUrl && (
                            <div className="mt-2">
                              <Image
                                src={childFormData.imageUrl}
                                alt="Child category preview"
                                width={100}
                                height={100}
                                className="img-thumbnail"
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Trạng thái con */}
                        <div className="form-group">
                          <div className="custom-control custom-switch">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="childIsActive"
                              name="isActive"
                              checked={childFormData.isActive}
                              onChange={handleChildInputChange}
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="childIsActive"
                            >
                              Kích hoạt
                            </label>
                          </div>
                        </div>

                        <button type="submit" className="btn btn-success">
                          <i className="fas fa-plus mr-1"></i> Thêm vào danh
                          sách
                        </button>
                      </form>
                    </div>
                  </div>
                )}
            </div>

            {/* Categories list */}
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Danh sách danh mục</h3>
                  <div className="card-tools">
                    <div
                      className="input-group input-group-sm"
                      style={{ width: "250px" }}
                    >
                      <input
                        type="text"
                        name="table_search"
                        className="form-control float-right"
                        placeholder="Tìm kiếm theo tên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <div className="input-group-append">
                        <button type="submit" className="btn btn-default">
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-body table-responsive p-0">
                  {loading ? (
                    <LoadingSpinner size="lg" text="Đang tải danh mục..." />
                  ) : (
                    <table className="table table-hover text-nowrap">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Hình ảnh</th>
                          <th>Tên danh mục</th>
                          <th>Slug</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCategories.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center">
                              Không có dữ liệu
                            </td>
                          </tr>
                        ) : (
                          // Hiển thị danh mục cha trước, sau đó là các danh mục con
                          filteredParentCategories.map((parentCategory) => (
                            <React.Fragment key={parentCategory.id}>
                              {/* Hiển thị danh mục cha */}
                              <tr className="bg-light">
                                <td>{parentCategory.id}</td>
                                <td>
                                  {parentCategory.image ? (
                                    <div>
                                      <Image
                                        src={parentCategory.image}
                                        alt={parentCategory.name}
                                        width={50}
                                        height={50}
                                        className="img-thumbnail mb-1"
                                        style={{ objectFit: "cover" }}
                                      />
                                      <div>
                                        <a
                                          href={getAbsoluteImageUrl(
                                            parentCategory.image
                                          )}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="small d-block text-primary"
                                        >
                                          <i className="fas fa-external-link-alt mr-1"></i>
                                          Xem link
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted">
                                      Không có hình
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <button
                                    className="btn btn-link p-0 font-weight-bold text-dark"
                                    onClick={() =>
                                      toggleCategoryExpansion(parentCategory.id)
                                    }
                                    style={{ textDecoration: "none" }}
                                  >
                                    <i
                                      className={`fas fa-${
                                        expandedCategories.has(
                                          parentCategory.id
                                        )
                                          ? "minus"
                                          : "plus"
                                      } mr-2 text-${
                                        expandedCategories.has(
                                          parentCategory.id
                                        )
                                          ? "danger"
                                          : "success"
                                      }`}
                                    ></i>
                                    {parentCategory.name}
                                  </button>
                                </td>
                                <td>{parentCategory.slug}</td>
                                <td>
                                  {parentCategory.isActive ? (
                                    <span className="badge badge-success">
                                      Hoạt động
                                    </span>
                                  ) : (
                                    <span className="badge badge-danger">
                                      Vô hiệu hóa
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <button
                                    onClick={() =>
                                      handleEditCategory(parentCategory)
                                    }
                                    className="btn btn-sm btn-info mr-1"
                                    title="Chỉnh sửa"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteRequest(parentCategory)
                                    }
                                    className="btn btn-sm btn-danger"
                                    title="Xóa"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </td>
                              </tr>

                              {/* Hiển thị các danh mục con nếu danh mục cha đang được mở */}
                              {expandedCategories.has(parentCategory.id) &&
                                getChildCategories(parentCategory.id)
                                  .filter((childCategory) =>
                                    childCategory.name
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                  )
                                  .map((childCategory) => (
                                    <tr
                                      key={childCategory.id}
                                      style={{ backgroundColor: "#fafafa" }}
                                    >
                                      <td>{childCategory.id}</td>
                                      <td>
                                        {childCategory.image ? (
                                          <div>
                                            <Image
                                              src={childCategory.image}
                                              alt={childCategory.name}
                                              width={50}
                                              height={50}
                                              className="img-thumbnail mb-1"
                                              style={{ objectFit: "cover" }}
                                            />
                                            <div>
                                              <a
                                                href={getAbsoluteImageUrl(
                                                  childCategory.image
                                                )}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="small d-block text-primary"
                                              >
                                                <i className="fas fa-external-link-alt mr-1"></i>
                                                Xem link
                                              </a>
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="text-muted">
                                            Không có hình
                                          </span>
                                        )}
                                      </td>
                                      <td>
                                        <span className="ml-4">
                                          └─ {childCategory.name}
                                        </span>
                                      </td>
                                      <td>{childCategory.slug}</td>
                                      <td>
                                        {childCategory.isActive ? (
                                          <span className="badge badge-success">
                                            Hoạt động
                                          </span>
                                        ) : (
                                          <span className="badge badge-danger">
                                            Vô hiệu hóa
                                          </span>
                                        )}
                                      </td>
                                      <td>
                                        <button
                                          onClick={() =>
                                            handleEditCategory(childCategory)
                                          }
                                          className="btn btn-sm btn-info mr-1"
                                          title="Chỉnh sửa"
                                        >
                                          <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteRequest(childCategory)
                                          }
                                          className="btn btn-sm btn-danger"
                                          title="Xóa"
                                        >
                                          <i className="fas fa-trash"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                            </React.Fragment>
                          ))
                        )}
                      </tbody>
                    </table>
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
        message={`Bạn có chắc chắn muốn xóa danh mục "${deleteConfirmation.itemName}"?`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmButtonClass="btn-danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      {/* toast noti */}
      {Toast}
    </AdminLayout>
  );
}
