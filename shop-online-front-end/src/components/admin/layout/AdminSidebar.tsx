import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/imgs/logo-coolmate-new-mobile-v2.svg";
interface MenuItem {
  title: string;
  path: string;
  icon: string;
  children?: MenuItem[];
}

interface AdminSidebarProps {
  openMenus: string[];
  toggleMenu: (path: string) => void;
}

export default function AdminSidebar({
  openMenus,
  toggleMenu,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: "fas fa-tachometer-alt",
    },
    {
      title: "Quản lý sản phẩm",
      path: "/admin/products",
      icon: "fas fa-tshirt",
      children: [
        {
          title: "Danh sách sản phẩm",
          path: "/admin/products",
          icon: "fas fa-list",
        },
        {
          title: "Thêm sản phẩm",
          path: "/admin/products/add",
          icon: "fas fa-plus",
        },
        {
          title: "Danh mục",
          path: "/admin/categories",
          icon: "fas fa-tags",
        },
      ],
    },
    {
      title: "Quản lý đơn hàng",
      path: "/admin/orders",
      icon: "fas fa-shopping-cart",
    },
    {
      title: "Quản lý người dùng",
      path: "/admin/users",
      icon: "fas fa-users",
    },
    {
      title: "Báo cáo & Thống kê",
      path: "/admin/reports",
      icon: "fas fa-chart-bar",
    },
    {
      title: "Cấu hình website",
      path: "/admin/settings",
      icon: "fas fa-cog",
      children: [
        {
          title: "Menu điều hướng",
          path: "/admin/navigation",
          icon: "fas fa-bars",
        },
        // Các menu khác...
      ],
    },
  ];

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
            <a href="#" className="d-block">
              Admin Name
            </a>
          </div>
        </div>
        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
          >
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={`nav-item ${item.children ? "has-treeview" : ""} ${
                  openMenus.includes(item.path) ||
                  item.path === pathname ||
                  (item.children &&
                    item.children.some((child) => child.path === pathname))
                    ? "menu-open"
                    : ""
                }`}
              >
                {item.children ? (
                  <a
                    href="#"
                    className={`nav-link ${
                      item.path === pathname ||
                      (item.children &&
                        item.children.some((child) => child.path === pathname))
                        ? "active"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleMenu(item.path);
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
                    className={`nav-link ${
                      item.path === pathname ? "active" : ""
                    }`}
                  >
                    <i className={`nav-icon ${item.icon}`}></i>
                    <p>{item.title}</p>
                  </Link>
                )}

                {item.children && (
                  <ul className="nav nav-treeview">
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex} className="nav-item">
                        <Link
                          href={child.path}
                          className={`nav-link ${
                            child.path === pathname ? "active" : ""
                          }`}
                        >
                          <i className={`nav-icon ${child.icon}`}></i>
                          <p>{child.title}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
