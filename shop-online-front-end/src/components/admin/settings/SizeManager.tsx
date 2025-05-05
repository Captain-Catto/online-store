import React, { useState, useEffect } from "react";
import { ProductService } from "@/services/ProductService";
import { useToast } from "@/utils/useToast";
import ConfirmModal from "@/components/admin/shared/ConfirmModal";
import { CategoryService } from "@/services/CategoryService";

interface Size {
  id: number;
  value: string;
  displayName: string;
  categoryId: string;
  displayOrder: number;
  active: boolean;
}

interface Category {
  id: number;
  name: string;
}

const SizeManager: React.FC = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newSize, setNewSize] = useState({
    value: "",
    displayName: "",
    categoryId: "",
    displayOrder: 0,
  });

  const [editId, setEditId] = useState<number | null>(null);

  // State quản lý xác nhận xóa
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: number | null;
    sizeName: string;
  }>({
    isOpen: false,
    id: null,
    sizeName: "",
  });

  const { showToast, Toast } = useToast();

  // Lấy danh sách kích thước
  const loadSizes = async () => {
    setLoading(true);
    try {
      const data = await ProductService.getSizes();
      setSizes(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách kích thước");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách danh mục
  const loadCategories = async () => {
    try {
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Không thể tải danh sách danh mục", err);
      showToast("Không thể tải danh sách danh mục", { type: "error" });
    }
  };

  useEffect(() => {
    loadSizes();
    loadCategories();
  }, []);

  // Xử lý thêm mới kích thước
  const handleAddSize = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSize.value || !newSize.categoryId) {
      showToast("Giá trị kích thước và danh mục không được để trống", {
        type: "error",
      });
      return;
    }

    try {
      await ProductService.createSize({
        value: newSize.value,
        displayName: newSize.displayName || newSize.value,
        categoryId: newSize.categoryId,
        displayOrder: newSize.displayOrder,
      });

      showToast("Thêm kích thước mới thành công", { type: "success" });
      setNewSize({
        value: "",
        displayName: "",
        categoryId: "",
        displayOrder: 0,
      });
      loadSizes();
    } catch {
      showToast("Không thể thêm kích thước", { type: "error" });
    }
  };

  // Xử lý cập nhật kích thước
  const handleUpdateSize = async (e: React.FormEvent, size: Size) => {
    e.preventDefault();

    try {
      await ProductService.updateSize(size.id, {
        value: size.value,
        displayName: size.displayName,
        categoryId: size.categoryId,
        displayOrder: size.displayOrder,
        active: size.active,
      });

      showToast("Cập nhật kích thước thành công", { type: "success" });
      setEditId(null);
      loadSizes();
    } catch {
      showToast("Không thể cập nhật kích thước", { type: "error" });
    }
  };

  // Hàm để mở modal xác nhận xóa
  const handleDeleteRequest = (size: Size) => {
    setDeleteConfirmation({
      isOpen: true,
      id: size.id,
      sizeName: size.displayName || size.value,
    });
  };

  // Hàm để đóng modal
  const handleCancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      id: null,
      sizeName: "",
    });
  };

  // Hàm thực hiện xóa sau khi đã xác nhận
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id) return;

    try {
      await ProductService.deleteSize(deleteConfirmation.id);
      showToast("Xóa kích thước thành công", { type: "success" });
      loadSizes();
    } catch {
      showToast("Không thể xóa kích thước", { type: "error" });
    } finally {
      handleCancelDelete();
    }
  };

  if (loading) return <div className="p-4 text-center">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Quản lý kích thước</h3>
      </div>
      <div className="card-body">
        {/* Form thêm kích thước mới */}
        <form className="form mb-4 p-3 border rounded" onSubmit={handleAddSize}>
          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label>Giá trị</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="S, M, L, XL..."
                  value={newSize.value}
                  onChange={(e) =>
                    setNewSize({ ...newSize, value: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label>Tên hiển thị</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Small, Medium..."
                  value={newSize.displayName}
                  onChange={(e) =>
                    setNewSize({ ...newSize, displayName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label>Danh mục</label>
                <select
                  className="form-control"
                  value={newSize.categoryId}
                  onChange={(e) =>
                    setNewSize({ ...newSize, categoryId: e.target.value })
                  }
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label>Thứ tự</label>
                <input
                  type="number"
                  className="form-control"
                  value={newSize.displayOrder}
                  onChange={(e) =>
                    setNewSize({
                      ...newSize,
                      displayOrder: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="col-md-1">
              <div className="form-group">
                <label>&nbsp;</label>
                <button type="submit" className="btn btn-primary btn-block">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Danh sách kích thước */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Giá trị</th>
                <th>Tên hiển thị</th>
                <th>Danh mục</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size, index) => (
                <tr key={size.id}>
                  <td>{index + 1}</td>
                  <td>
                    {editId === size.id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={size.value}
                        onChange={(e) => {
                          const updatedSizes = [...sizes];
                          updatedSizes[index].value = e.target.value;
                          setSizes(updatedSizes);
                        }}
                      />
                    ) : (
                      size.value
                    )}
                  </td>
                  <td>
                    {editId === size.id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={size.displayName}
                        onChange={(e) => {
                          const updatedSizes = [...sizes];
                          updatedSizes[index].displayName = e.target.value;
                          setSizes(updatedSizes);
                        }}
                      />
                    ) : (
                      size.displayName
                    )}
                  </td>
                  <td>
                    {editId === size.id ? (
                      <select
                        className="form-control"
                        value={size.categoryId}
                        onChange={(e) => {
                          const updatedSizes = [...sizes];
                          updatedSizes[index].categoryId = e.target.value;
                          setSizes(updatedSizes);
                        }}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      categories.find((cat) => cat.id === size.categoryId)
                        ?.name || size.categoryId
                    )}
                  </td>
                  <td>
                    {editId === size.id ? (
                      <input
                        type="number"
                        className="form-control"
                        value={size.displayOrder}
                        onChange={(e) => {
                          const updatedSizes = [...sizes];
                          updatedSizes[index].displayOrder = parseInt(
                            e.target.value
                          );
                          setSizes(updatedSizes);
                        }}
                      />
                    ) : (
                      size.displayOrder
                    )}
                  </td>
                  <td>
                    {editId === size.id ? (
                      <select
                        className="form-control"
                        value={size.active ? "1" : "0"}
                        onChange={(e) => {
                          const updatedSizes = [...sizes];
                          updatedSizes[index].active = e.target.value === "1";
                          setSizes(updatedSizes);
                        }}
                      >
                        <option value="1">Kích hoạt</option>
                        <option value="0">Vô hiệu</option>
                      </select>
                    ) : (
                      <span
                        className={`badge ${
                          size.active ? "badge-success" : "badge-danger"
                        }`}
                      >
                        {size.active ? "Kích hoạt" : "Vô hiệu"}
                      </span>
                    )}
                  </td>
                  <td>
                    {editId === size.id ? (
                      <>
                        <button
                          className="btn btn-sm btn-success mr-1"
                          onClick={(e) => handleUpdateSize(e, size)}
                        >
                          <i className="fas fa-save"></i> Lưu
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditId(null)}
                        >
                          <i className="fas fa-times"></i> Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-info mr-1"
                          onClick={() => setEditId(size.id)}
                        >
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteRequest(size)}
                        >
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {sizes.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center">
                    Chưa có dữ liệu kích thước
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal xác nhận xóa */}
      <ConfirmModal
        isOpen={deleteConfirmation.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa kích thước "${deleteConfirmation.sizeName}"?`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmButtonClass="btn-danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Thông báo */}
      {Toast}
    </div>
  );
};

export default SizeManager;
