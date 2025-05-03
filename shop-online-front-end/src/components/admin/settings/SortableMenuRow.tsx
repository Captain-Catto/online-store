import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuItemData } from "@/hooks/useAdminMenu";

interface SortableTableRowProps {
  item: MenuItemData;
  isParentItem?: boolean;
  isActive?: boolean;
  onEdit: (item: MenuItemData) => void;
  onDelete: (item: MenuItemData) => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  isChild?: boolean;
}

export default function SortableTableRow({
  item,
  isParentItem = false,
  isActive = false,
  onEdit,
  onDelete,
  onToggleExpand,
  isExpanded = false,
  isChild = false,
}: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id.toString(),
    data: { item },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isActive ? "bg-light" : ""} ${isChild ? "child-row" : ""} ${
        isDragging ? "is-dragging" : ""
      }`}
    >
      <td>
        <div
          className="drag-handle"
          {...attributes}
          {...listeners}
          style={{ cursor: "grab" }}
        >
          <i className="fas fa-grip-vertical"></i>
        </div>
      </td>
      <td>
        <div className="d-flex align-items-center">
          {isChild && <span className="ml-4"></span>}
          {isParentItem && onToggleExpand && (
            <button
              type="button"
              className="btn btn-sm btn-link p-0 mr-2"
              onClick={onToggleExpand}
            >
              <i
                className={`fas fa-chevron-${isExpanded ? "down" : "right"}`}
              ></i>
            </button>
          )}
          <span
            className={isParentItem ? "font-weight-bold" : ""}
            style={isChild ? { marginLeft: "20px" } : {}}
          >
            {item.title}
          </span>
        </div>
      </td>
      <td>{item.path}</td>
      <td>
        <i className={item.icon}></i>
      </td>
      <td>{item.displayOrder}</td>
      <td>
        <button
          type="button"
          className="btn btn-info btn-sm mr-1"
          onClick={() => onEdit(item)}
        >
          <i className="fas fa-edit"></i>
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(item)}
        >
          <i className="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  );
}
