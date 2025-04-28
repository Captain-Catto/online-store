import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTableRowProps {
  item: {
    id: number;
    name: string;
    link: string | null;
    categoryId: number | null;
    parentId: number | null;
    isActive: boolean;
    megaMenu: boolean;
  };
  isParentItem: boolean;
  isActive: boolean;
  isChild?: boolean;
  isExpanded?: boolean;
  onEdit: (item: {
    id: number;
    name: string;
    link: string | null;
    categoryId: number | null;
    parentId: number | null;
    isActive: boolean;
    megaMenu: boolean;
  }) => void;
  onDelete: (id: number) => void;
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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isActive ? "#f8fafc" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style} className={isChild ? "bg-light" : ""}>
      <td {...attributes} {...listeners} style={{ cursor: "grab" }}>
        <i className="fas fa-grip-vertical text-muted"></i>
      </td>
      <td>
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
          onClick={() => onDelete(item.id)}
          className="btn btn-sm btn-danger"
        >
          <i className="fas fa-trash"></i> Xóa
        </button>
      </td>
    </tr>
  );
};

export default SortableTableRow;
