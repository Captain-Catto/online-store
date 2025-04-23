import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NavigationMenuItem } from "@/services/NaviagationService";

interface SortableTableRowProps {
  item: NavigationMenuItem;
  isParentItem: boolean;
  isActive: boolean;
  onEdit: (item: NavigationMenuItem) => void;
  onDelete: (id: number) => void;
}

export default function SortableTableRow({
  item,
  isParentItem,
  isActive,
  onEdit,
  onDelete,
}: SortableTableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isActive ? "#f0f8ff" : undefined,
  };

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className={!isParentItem ? "bg-light" : ""}
      >
        <td {...attributes} {...listeners} style={{ cursor: "grab" }}>
          <i className="fas fa-grip-vertical text-muted"></i>
        </td>
        <td>
          {!isParentItem && <span className="pl-3">↳ </span>}
          {item.name}
        </td>
        <td>
          {item.category ? `Danh mục: ${item.category.name}` : item.link || "—"}
        </td>
        <td>
          {item.megaMenu ? (
            <span className="badge badge-info">Mega Menu</span>
          ) : isParentItem ? (
            <span className="badge badge-primary">Menu chính</span>
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
    </>
  );
}
