import React, { useState, useEffect } from "react";
import { ProductService } from "@/services/ProductService";
import { useToast } from "@/utils/useToast";
import ConfirmModal from "@/components/admin/shared/ConfirmModal";

interface Size {
  id: number;
  value: string;
  displayName: string;
  category: string;
  displayOrder: number;
  active: boolean;
}

// Cập nhật interface Size
interface Size {
  id: number;
  value: string;
  displayName: string;
  category: string;
  sizeType: string; // Thêm trường này
  displayOrder: number;
  active: boolean;
}

const SizeManager: React.FC = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newSize, setNewSize] = useState({
    value: "",
    displayName: "",
    category: "clothing",
    sizeType: "letter",
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

  const categories = [
    { value: "clothing", label: "Quần áo" },
    { value: "shoes", label: "Giày dép" },
    { value: "accessories", label: "Phụ kiện" },
  ];

  const sizeTypes = [
    { value: "letter", label: "Size chữ (S, M, L...)" },
    { value: "number", label: "Size số (28, 29, 30...)" },
    { value: "inch", label: "Size inch (38, 39, 40...)" },
    { value: "european", label: "Size châu Âu" },
    { value: "age", label: "Size theo tuổi (3-4T...)" },
  ];

  // Lấy danh sách sizes
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

  useEffect(() => {
    loadSizes();
  }, []);

  // Xử lý thêm mới
  const handleAddSize = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSize.value) {
      showToast("Giá trị kích thước không được để trống", { type: "error" });
      return;
    }

    try {
      await ProductService.createSize({
        value: newSize.value,
        displayName: newSize.displayName || newSize.value,
        category: newSize.category,
        displayOrder: newSize.displayOrder,
      });

      showToast("Thêm kích thước mới thành công", { type: "success" });
      setNewSize({
        value: "",
        displayName: "",
        category: "clothing",
        sizeType: "letter",
        displayOrder: 0,
      });
      loadSizes();
    } catch {
      showToast("Không thể thêm kích thước", { type: "error" });
    }
  };

  // Xử lý cập nhật
  const handleUpdateSize = async (e: React.FormEvent, size: Size) => {
    e.preventDefault();

    try {
      await ProductService.updateSize(size.id, {
        value: size.value,
        displayName: size.displayName,
        category: size.category,
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
      // Đóng modal sau khi hoàn tất
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
                  value={newSize.category}
                  onChange={(e) =>
                    setNewSize({ ...newSize, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
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
          <div className="col-md-3">
            <div className="form-group">
              <label>Loại kích thước</label>
              <select
                className="form-control"
                value={newSize.sizeType}
                onChange={(e) =>
                  setNewSize({ ...newSize, sizeType: e.target.value })
                }
              >
                {sizeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Danh sách kích thước */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "13%" }}>Giá trị</th>
                <th style={{ width: "17%" }}>Tên hiển thị</th>
                <th style={{ width: "15%" }}>Danh mục</th>
                <th style={{ width: "15%" }}>Loại kích thước</th>
                <th style={{ width: "10%" }}>Thứ tự</th>
                <th style={{ width: "10%" }}>Trạng thái</th>
                <th style={{ width: "15%" }}>Thao tác</th>
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
                        value={size.category}
                        onChange={(e) => {
                          const updatedSizes = [...sizes];
                          updatedSizes[index].category = e.target.value;
                          setSizes(updatedSizes);
                        }}
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      categories.find((cat) => cat.value === size.category)
                        ?.label || size.category
                    )}
                  </td>
                  <td>
                    {editId === size.id ? (
                      <select
                        className="form-control"
                        value={size.sizeType}
                        onChange={(e) => {
                          const updatedSizes = [...sizes];
                          updatedSizes[index].sizeType = e.target.value;
                          setSizes(updatedSizes);
                        }}
                      >
                        {sizeTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      sizeTypes.find((type) => type.value === size.sizeType)
                        ?.label || size.sizeType
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
                  <td colSpan={8} className="text-center">
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
