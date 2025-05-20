import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NavigationMenuItem } from "@/services/NaviagationService";

interface SortableTableRowProps {
  item: NavigationMenuItem;
  isParentItem: boolean;
  isActive: boolean;
  isChild?: boolean;
  isExpanded?: boolean;
  onEdit: (item: NavigationMenuItem) => void;
  onDelete: (item: NavigationMenuItem) => void;
  onToggleExpand?: () => void;
}

const SortableTableRow = ({
  item,
  isParentItem,
  isActive,
  isChild = false,
  isExpanded = false,
  onEdit,
  onDelete,
  onToggleExpand,
}: SortableTableRowProps) => {
  // Sử dụng useSortable để tạo sortable row
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id.toString() });

  // Kiểm tra xem item có đang được kéo hay không
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isActive ? "#f8fafc" : undefined,
  };

  return (
    // Sử dụng ref từ useSortable để tạo sortable row
    <tr ref={setNodeRef} style={style} className={isChild ? "bg-light" : ""}>
      {/* Cột kéo thả */}
      <td {...attributes} {...listeners} style={{ cursor: "grab" }}>
        <i className="fas fa-grip-vertical text-muted"></i>
      </td>
      <td>
        {/* Hiển thị tên item */}
        {/* Nếu là item con, chỉ hiển thị tên mà không có nút mở rộng */}
        {/* Nếu là item cha, hiển thị nút mở rộng nếu có */}
        {isChild ? (
          <span className="ml-4">└─ {item.name}</span>
        ) : (
          <div className="d-flex align-items-center">
            {isParentItem && onToggleExpand && (
              <button
                className="btn btn-sm p-0 mr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
                title={isExpanded ? "Thu gọn" : "Mở rộng"}
              >
                <i
                  className={`fas fa-${isExpanded ? "minus" : "plus"} text-${
                    isExpanded ? "danger" : "success"
                  }`}
                ></i>
              </button>
            )}
            <span>{item.name}</span>
          </div>
        )}
      </td>

      {/* Hiển thị đường dẫn */}
      <td>
        {item.link || (item.categoryId ? `Danh mục: ${item.categoryId}` : "")}
      </td>
      <td>
        {isParentItem ? (
          item.megaMenu ? (
            <span className="badge badge-info">Mega Menu</span>
          ) : (
            <span className="badge badge-primary">Menu thường</span>
          )
        ) : (
          <span className="badge badge-secondary">Menu con</span>
        )}
      </td>
      <td>
        {item.isActive ? (
          <span className="badge badge-success">Hiển thị</span>
        ) : (
          <span className="badge badge-danger">Ẩn</span>
        )}
      </td>
      <td>
        <button
          onClick={() => onEdit(item)}
          className="btn btn-sm btn-info mr-1"
        >
          <i className="fas fa-edit"></i> Sửa
        </button>
        <button
          onClick={() => onDelete(item)}
          className="btn btn-sm btn-danger"
        >
          <i className="fas fa-trash"></i> Xóa
        </button>
      </td>
    </tr>
  );
};

export default SortableTableRow;
