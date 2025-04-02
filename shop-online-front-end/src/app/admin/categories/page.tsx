"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Breadcrumb from "@/components/admin/shared/Breadcrumb";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  image: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

interface CategoryFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  isActive: boolean;
  image?: File | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryFormData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form data state
  const initialFormData: CategoryFormData = {
    name: "",
    slug: "",
    description: "",
    parentId: null,
    isActive: true,
    image: null,
  };

  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/admin" },
    { label: "Sản phẩm", href: "/admin/products" },
    { label: "Danh mục", active: true },
  ];

  useEffect(() => {
    // Fetch categories data from API
    // For now, let's use mock data
    const mockCategories: Category[] = [
      {
        id: "cat1",
        name: "Áo",
        slug: "ao",
        description: "Các loại áo nam, nữ",
        parentId: null,
        image:
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
        isActive: true,
        productCount: 45,
        createdAt: "01/01/2025",
      },
      {
        id: "cat2",
        name: "Áo thun",
        slug: "ao-thun",
        description: "Áo thun nam nữ các loại",
        parentId: "cat1",
        image:
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
        isActive: true,
        productCount: 30,
        createdAt: "01/01/2025",
      },
      {
        id: "cat3",
        name: "Áo sơ mi",
        slug: "ao-so-mi",
        description: "Áo sơ mi nam nữ các loại",
        parentId: "cat1",
        image:
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
        isActive: true,
        productCount: 15,
        createdAt: "01/01/2025",
      },
      {
        id: "cat4",
        name: "Quần",
        slug: "quan",
        description: "Các loại quần nam, nữ",
        parentId: null,
        image:
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
        isActive: true,
        productCount: 35,
        createdAt: "01/01/2025",
      },
      {
        id: "cat5",
        name: "Quần jean",
        slug: "quan-jean",
        description: "Quần jean nam nữ các loại",
        parentId: "cat4",
        image:
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
        isActive: true,
        productCount: 20,
        createdAt: "01/01/2025",
      },
      {
        id: "cat6",
        name: "Quần kaki",
        slug: "quan-kaki",
        description: "Quần kaki nam nữ các loại",
        parentId: "cat4",
        image:
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
        isActive: true,
        productCount: 15,
        createdAt: "01/01/2025",
      },
      {
        id: "cat7",
        name: "Phụ kiện",
        slug: "phu-kien",
        description: "Các loại phụ kiện thời trang",
        parentId: null,
        image:
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
        isActive: false,
        productCount: 25,
        createdAt: "01/01/2025",
      },
    ];

    setCategories(mockCategories);
    setIsLoading(false);
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find parent category name by ID
  const getParentCategoryName = (parentId: string | null): string => {
    if (!parentId) return "-";
    const parent = categories.find((category) => category.id === parentId);
    return parent ? parent.name : "-";
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-generate slug from name if slug field is empty
    if (name === "name" && (!formData.slug || formData.slug === "")) {
      const slug = value
        .toLowerCase()
        .replace(/đ/g, "d")
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-");
      setFormData({ ...formData, name: value, slug });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map((category) =>
        category.id === editingCategory.id
          ? {
              ...category,
              name: formData.name,
              slug: formData.slug,
              description: formData.description,
              parentId: formData.parentId,
              isActive: formData.isActive,
              // In a real app, you would upload the image and get a URL
              image: imagePreview || category.image,
            }
          : category
      );
      setCategories(updatedCategories);
    } else {
      // Add new category
      const newCategory: Category = {
        id: `cat${categories.length + 1}`,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parentId: formData.parentId,
        isActive: formData.isActive,
        image:
          imagePreview ||
          "https://shop-online-images.s3.ap-southeast-2.amazonaws.com/ao-thun-nam-cotton/AT.220.xd.12.webp",
        productCount: 0,
        createdAt: new Date().toLocaleDateString("vi-VN"),
      };
      setCategories([...categories, newCategory]);
    }

    // Reset form
    resetForm();
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingCategory(null);
    setShowForm(false);
    setImagePreview(null);
  };

  // Edit category handler
  const handleEditCategory = (category: Category) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
    });
    setFormData({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      image: null,
    });
    setImagePreview(category.image);
    setShowForm(true);
  };

  // Delete category handler
  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      const updatedCategories = categories.filter(
        (category) => category.id !== categoryId
      );
      setCategories(updatedCategories);
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
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          {/* Top action buttons */}
          <div className="mb-3">
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="btn btn-primary"
            >
              <i className="fas fa-plus mr-1"></i> Thêm danh mục mới
            </button>
            <Link
              href="/admin/products"
              className="btn btn-outline-secondary ml-2"
            >
              <i className="fas fa-tshirt mr-1"></i> Quản lý sản phẩm
            </Link>
          </div>

          {/* Form area */}
          {showForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title">
                  {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
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
                  <div className="row">
                    <div className="col-md-6">
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
                          Slug sẽ được sử dụng cho URL của danh mục.
                        </small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="parentId">Danh mục cha</label>
                        <select
                          className="form-control"
                          id="parentId"
                          name="parentId"
                          value={formData.parentId || ""}
                          onChange={handleInputChange}
                        >
                          <option value="">Không có (danh mục gốc)</option>
                          {categories
                            .filter((cat) => cat.parentId === null)
                            .map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
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
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleCheckboxChange}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="isActive"
                          >
                            Kích hoạt
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Nhập mô tả về danh mục"
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label htmlFor="image">Hình ảnh danh mục</label>
                        <div className="input-group">
                          <div className="custom-file">
                            <input
                              type="file"
                              className="custom-file-input"
                              id="image"
                              name="image"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                            <label
                              className="custom-file-label"
                              htmlFor="image"
                            >
                              {formData.image ? "Đã chọn 1 file" : "Chọn file"}
                            </label>
                          </div>
                        </div>
                        {imagePreview && (
                          <div
                            className="mt-2 position-relative"
                            style={{ height: "200px" }}
                          >
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              sizes="(max-width: 768px) 100vw, 400px"
                              style={{ objectFit: "contain" }}
                              className="img-thumbnail"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button type="submit" className="btn btn-primary mr-2">
                      {editingCategory ? "Cập nhật" : "Thêm danh mục"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={resetForm}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Search and filters */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Tìm kiếm và lọc</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="input-group-append">
                  <button className="btn btn-default">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Danh sách danh mục</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div className="card-body table-responsive p-0">
              {isLoading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Đang tải...</span>
                  </div>
                </div>
              ) : filteredCategories.length > 0 ? (
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Hình ảnh</th>
                      <th>Tên danh mục</th>
                      <th>Slug</th>
                      <th>Danh mục cha</th>
                      <th>Số sản phẩm</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th style={{ width: "120px" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          <Image
                            src={category.image}
                            alt={category.name}
                            width="50"
                            height="50"
                            className="img-thumbnail"
                          />
                        </td>
                        <td>{category.name}</td>
                        <td>{category.slug}</td>
                        <td>{getParentCategoryName(category.parentId)}</td>
                        <td>
                          <span className="badge bg-info">
                            {category.productCount}
                          </span>
                        </td>
                        <td>
                          {category.isActive ? (
                            <span className="badge bg-success">Kích hoạt</span>
                          ) : (
                            <span className="badge bg-danger">Vô hiệu hóa</span>
                          )}
                        </td>
                        <td>{category.createdAt}</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-primary mr-1"
                              title="Chỉnh sửa"
                              onClick={() => handleEditCategory(category)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              title="Xóa"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center p-4">
                  <p>Không tìm thấy danh mục nào phù hợp.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
