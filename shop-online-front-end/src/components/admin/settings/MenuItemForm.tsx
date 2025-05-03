// filepath: d:\desktop\hoc\khoa-iron-hack\J2345\project\online-store\shop-online-front-end\src\components\admin\settings\MenuItemForm.tsx
import React, { useState, useEffect } from "react";
import { MenuItemData } from "@/hooks/useAdminMenu";

interface MenuItemFormProps {
  initialData: MenuItemData | null;
  menuItems: MenuItemData[]; // Để chọn parent
  onSubmit: (
    formData:
      | Omit<MenuItemData, "id" | "createdAt" | "updatedAt">
      | MenuItemData
  ) => void;
  onCancel: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  initialData,
  menuItems,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    path: "",
    icon: "",
    parentId: "" as string | null, // Lưu dạng string để dễ xử lý select
    displayOrder: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        path: initialData.path,
        icon: initialData.icon,
        parentId: initialData.parentId ? String(initialData.parentId) : "", // Chuyển sang string
        displayOrder: initialData.displayOrder,
      });
    } else {
      // Reset form khi thêm mới
      setFormData({
        title: "",
        path: "",
        icon: "",
        parentId: "",
        displayOrder: 0,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      // Chuyển parentId về number hoặc null trước khi gửi
      parentId: formData.parentId ? parseInt(formData.parentId, 10) : null,
    };
    // Nếu là edit, thêm id vào
    if (initialData) {
      onSubmit({ ...submitData, id: initialData.id });
    } else {
      onSubmit(submitData);
    }
  };

  // Lọc ra item hiện tại và con của nó khỏi danh sách parent tiềm năng
  const getPotentialParents = () => {
    if (!initialData) return menuItems; // Khi thêm mới, tất cả đều có thể là cha
    const childrenIds = new Set<number>();
    const findChildrenRecursive = (parentId: number) => {
      menuItems.forEach((item) => {
        if (item.parentId === parentId) {
          childrenIds.add(item.id);
          findChildrenRecursive(item.id);
        }
      });
    };
    findChildrenRecursive(initialData.id);
    return menuItems.filter(
      (item) => item.id !== initialData.id && !childrenIds.has(item.id)
    );
  };

  const potentialParents = getPotentialParents();

  // --- Giao diện Form (ví dụ dùng Modal của Bootstrap hoặc component Modal riêng) ---
  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {initialData ? "Sửa Menu Item" : "Thêm Menu Item"}
              </h5>
              <button type="button" className="close" onClick={onCancel}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Đường dẫn *</label>
                <input
                  type="text"
                  name="path"
                  value={formData.path}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="Ví dụ: products hoặc settings/menu hoặc #"
                />
                <small className="form-text text-muted">
                  Nhập đường dẫn tương đối (không cần &apos;/admin&apos;). Sử
                  dụng &apos;#&apos; cho menu không có link trực tiếp.
                </small>
              </div>
              <div className="form-group">
                <label>Icon *</label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="Ví dụ: fas fa-list"
                />
                <small>
                  Sử dụng class của Font Awesome (ví dụ: fas fa-users)
                </small>
              </div>
              <div className="form-group">
                <label>Menu Cha</label>
                <select
                  name="parentId"
                  value={formData.parentId ?? ""}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">-- Là menu gốc --</option>
                  {potentialParents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} (ID: {item.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Thứ tự hiển thị</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuItemForm;
