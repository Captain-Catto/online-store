// filepath: d:\desktop\hoc\khoa-iron-hack\J2345\project\online-store\shop-online-front-end\src\components\admin\settings\MenuItemList.tsx
import React from "react";
import { MenuItemData } from "@/hooks/useAdminMenu";

interface MenuItemListProps {
  items: MenuItemData[];
  onEdit: (item: MenuItemData) => void;
  onDelete: (id: number) => void;
}

const MenuItemList: React.FC<MenuItemListProps> = ({
  items,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="card">
      <div className="card-body p-0">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Đường dẫn</th>
              <th>Icon</th>
              <th>Parent ID</th>
              <th>Thứ tự</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.path}</td>
                <td>
                  <i className={item.icon}></i> ({item.icon})
                </td>
                <td>{item.parentId ?? "N/A"}</td>
                <td>{item.displayOrder}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info mr-1"
                    onClick={() => onEdit(item)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(item.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuItemList;
