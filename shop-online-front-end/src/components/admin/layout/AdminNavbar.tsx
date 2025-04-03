import Link from "next/link";

interface AdminNavbarProps {
  toggleSidebar: () => void;
}

export default function AdminNavbar({ toggleSidebar }: AdminNavbarProps) {
  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      {/* Left navbar links */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a
            className="nav-link"
            data-widget="pushmenu"
            href="#"
            role="button"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars"></i>
          </a>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <Link href="/admin" className="nav-link">
            Home
          </Link>
        </li>
      </ul>

      {/* Right navbar links */}
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <a
            className="nav-link"
            data-widget="fullscreen"
            href="#"
            role="button"
          >
            <i className="fas fa-expand-arrows-alt"></i>
          </a>
        </li>
        <li className="nav-item dropdown">
          <a className="nav-link" data-toggle="dropdown" href="#">
            <i className="fas fa-user-circle"></i>
          </a>
          <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
            <span className="dropdown-item dropdown-header">Admin User</span>
            <div className="dropdown-divider"></div>
            <Link href="/admin/profile" className="dropdown-item">
              <i className="fas fa-user mr-2"></i> Hồ sơ
            </Link>
            <div className="dropdown-divider"></div>
            <Link href="/logout" className="dropdown-item">
              <i className="fas fa-sign-out-alt mr-2"></i> Đăng xuất
            </Link>
          </div>
        </li>
      </ul>
    </nav>
  );
}
