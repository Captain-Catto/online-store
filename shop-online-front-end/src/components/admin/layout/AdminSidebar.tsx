import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/imgs/logo-coolmate-new-mobile-v2.svg";
import { useAdminMenu, HierarchicalMenuItem } from "@/hooks/useAdminMenu"; // Import hook và interface mới
import LoadingSpinner from "@/components/UI/LoadingSpinner";

interface AdminSidebarProps {
  openMenuIds: number[];
  toggleMenu: (id: number) => void;
}

export default function AdminSidebar({
  openMenuIds,
  toggleMenu,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { hierarchicalMenu, loading, error } = useAdminMenu(); // Sử dụng hook

  // Hàm render menu item
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
            {item.children.map((child) => renderMenuItem(child))}
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
        {/* Sidebar user panel */}
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
            <a href="/admin/profile" className="d-block">
              Admin
            </a>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
            data-accordion="false"
          >
            {loading ? (
              <li className="nav-item p-3 text-center">
                <LoadingSpinner size="lg" color="white" className="mt-2" />
              </li>
            ) : error ? (
              <li className="nav-item">
                <div className="nav-link">
                  <i className="nav-icon fas fa-exclamation-triangle text-danger"></i>
                  <p className="text-danger">{error}</p>
                </div>
              </li>
            ) : (
              hierarchicalMenu.map((item) => renderMenuItem(item))
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
