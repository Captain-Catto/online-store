import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Suitability {
  id: number;
  name: string;
  description: string;
}

interface SortableSuitabilityRowProps {
  item: Suitability;
  isActive: boolean;
  onEdit: (item: Suitability) => void;
  onDelete: (item: Suitability) => void;
}

const SortableSuitabilityRow = ({
  item,
  isActive,
  onEdit,
  onDelete,
}: SortableSuitabilityRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isActive ? "#f8fafc" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td {...attributes} {...listeners} style={{ cursor: "grab" }}>
        <i className="fas fa-grip-vertical text-muted"></i>
      </td>
      <td>{item.id}</td>
      <td>{item.name}</td>
      <td>{item.description || "Không có mô tả"}</td>
      <td>
        <button
          className="btn btn-sm btn-info mr-1"
          onClick={() => onEdit(item)}
        >
          <i className="fas fa-edit"></i> Sửa
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(item)}
        >
          <i className="fas fa-trash"></i> Xóa
        </button>
      </td>
    </tr>
  );
};

export default SortableSuitabilityRow;
