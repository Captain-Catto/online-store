import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/imgs/logo-coolmate-new-mobile-v2.svg";
import { useAdminMenu, HierarchicalMenuItem } from "@/hooks/useAdminMenu"; // Import hook và interface mới

// Interface MenuItem gốc không cần nữa nếu dùng HierarchicalMenuItem

interface AdminSidebarProps {
  openMenuIds: number[]; // Thay đổi từ strings sang numbers
  toggleMenu: (id: number) => void; // Thay đổi từ path sang id
}

export default function AdminSidebar({
  openMenuIds,
  toggleMenu,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { hierarchicalMenu, loading, error } = useAdminMenu(); // Sử dụng hook

  // Hàm render menu item (có thể tách ra component riêng nếu phức tạp)
  const renderMenuItem = (item: HierarchicalMenuItem) => {
    const isActive =
      pathname === item.path ||
      (item.children && item.children.some((child) => child.path === pathname));
    const isOpen = openMenuIds.includes(item.id) || isActive;

    return (
      <li
        key={item.id} // Sử dụng ID từ DB làm key
        className={`nav-item ${
          item.children.length > 0 ? "has-treeview" : ""
        } ${isOpen ? "menu-open" : ""}`}
      >
        {item.children.length > 0 ? (
          <a
            href="#"
            className={`nav-link ${isActive ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              toggleMenu(item.id);
            }}
          >
            <i className={`nav-icon ${item.icon}`}></i>
            <p>
              {item.title}
              <i className="right fas fa-angle-left"></i>
            </p>
          </a>
        ) : (
          <Link
            href={item.path}
            className={`nav-link ${pathname === item.path ? "active" : ""}`}
          >
            <i className={`nav-icon ${item.icon}`}></i>
            <p>{item.title}</p>
          </Link>
        )}

        {item.children.length > 0 && (
          <ul className="nav nav-treeview">
            {item.children.map((child) => renderMenuItem(child))}{" "}
            {/* Đệ quy để render children */}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand Logo */}
      <Link href="/admin" className="brand-link">
        <span className="brand-text font-weight-light">Shop Online Admin</span>
      </Link>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Sidebar user panel (giữ nguyên hoặc cập nhật động) */}
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <Image
              src={logo}
              alt="Shop Online Logo"
              width={50}
              height={50}
              priority
            />
          </div>
          <div className="info">
            <a href="#" className="d-block">
              Admin Name {/* Có thể lấy tên user động */}
            </a>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="mt-2">
          {loading && <p className="text-light p-3">Đang tải menu...</p>}
          {error && <p className="text-danger p-3">{error}</p>}
          {!loading && !error && (
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
              data-accordion="false" // Quan trọng: để quản lý đóng/mở bằng state React
            >
              {hierarchicalMenu.map((item) => renderMenuItem(item))}
            </ul>
          )}
        </nav>
      </div>
    </aside>
  );
}
