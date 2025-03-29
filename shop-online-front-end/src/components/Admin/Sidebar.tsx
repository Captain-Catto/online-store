import React from "react";
import Image from "next/image";

const Sidebar: React.FC = () => {
  return (
    <aside className="flex flex-col bg-gray-800 text-white h-screen p-4">
      {/* Brand Logo */}
      <a href="index3.html" className="flex items-center space-x-3 mb-6">
        <Image
          src="dist/img/AdminLTELogo.png"
          alt="AdminLTE Logo"
          className="rounded-full w-12 h-12"
        />
        <span className="text-xl font-light">AdminLTE 3</span>
      </a>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        {/* User Panel */}
        <div className="flex items-center space-x-3 mt-3 pb-3 mb-3 border-b border-gray-700">
          <Image
            src="dist/img/user2-160x160.jpg"
            alt="User Image"
            className="w-12 h-12 rounded-full"
          />
          <span>Alexander Pierce</span>
        </div>

        {/* Sidebar Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
          />
          <button className="absolute top-0 right-0 p-2 text-gray-400">
            <i className="fas fa-search"></i>
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="space-y-2">
          <ul className="space-y-2">
            {/* Dashboard Menu */}
            <li className="group">
              <a
                href="#"
                className="flex items-center p-2 space-x-2 text-gray-300 hover:bg-gray-600 rounded"
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
                <i className="fas fa-angle-left ml-auto"></i>
              </a>
              <ul className="space-y-1 pl-5 mt-1 group-hover:block hidden">
                <li>
                  <a
                    href="./index.html"
                    className="flex items-center space-x-2 p-2 text-gray-400 hover:bg-gray-600 rounded"
                  >
                    Dashboard v1
                  </a>
                </li>
                <li>
                  <a
                    href="./index2.html"
                    className="flex items-center space-x-2 p-2 text-gray-400 hover:bg-gray-600 rounded"
                  >
                    Dashboard v2
                  </a>
                </li>
                <li>
                  <a
                    href="./index3.html"
                    className="flex items-center space-x-2 p-2 text-gray-400 hover:bg-gray-600 rounded"
                  >
                    Dashboard v3
                  </a>
                </li>
              </ul>
            </li>

            {/* Widgets Menu */}
            <li>
              <a
                href="pages/widgets.html"
                className="flex items-center p-2 space-x-2 text-gray-300 hover:bg-gray-600 rounded"
              >
                <i className="fas fa-th"></i>
                <span>Widgets</span>
                <span className="badge bg-red-500 ml-auto">New</span>
              </a>
            </li>

            {/* Layout Options Menu */}
            <li className="group">
              <a
                href="#"
                className="flex items-center p-2 space-x-2 text-gray-300 hover:bg-gray-600 rounded"
              >
                <i className="fas fa-copy"></i>
                <span>Layout Options</span>
                <i className="fas fa-angle-left ml-auto"></i>
              </a>
              <ul className="space-y-1 pl-5 mt-1 group-hover:block hidden">
                <li>
                  <a
                    href="pages/layout/top-nav.html"
                    className="flex items-center space-x-2 p-2 text-gray-400 hover:bg-gray-600 rounded"
                  >
                    Top Navigation
                  </a>
                </li>
                <li>
                  <a
                    href="pages/layout/boxed.html"
                    className="flex items-center space-x-2 p-2 text-gray-400 hover:bg-gray-600 rounded"
                  >
                    Boxed
                  </a>
                </li>
                <li>
                  <a
                    href="pages/layout/fixed-sidebar.html"
                    className="flex items-center space-x-2 p-2 text-gray-400 hover:bg-gray-600 rounded"
                  >
                    Fixed Sidebar
                  </a>
                </li>
                <li>
                  <a
                    href="pages/layout/fixed-topnav.html"
                    className="flex items-center space-x-2 p-2 text-gray-400 hover:bg-gray-600 rounded"
                  >
                    Fixed Navbar
                  </a>
                </li>
              </ul>
            </li>

            {/* Tables Menu */}
            <li>
              <a
                href="#"
                className="flex items-center p-2 space-x-2 text-gray-300 hover:bg-gray-600 rounded"
              >
                <i className="fas fa-table"></i>
                <span>Tables</span>
                <i className="fas fa-angle-left ml-auto"></i>
              </a>
              <ul className="space-y-1 pl-5 mt-1 hidden">
                <li>
                  <a
                    href="pages/tables/simple.html"
                    className="flex items-center space-x-2 p-2 text-gray-400 hover:bg-gray-600 rounded"
                  >
                    Simple Tables
                  </a>
                </li>
                <li>
                  <a
                    href="pages/tables/data.html"
                    className="flex items-center space-x-2 p-2 text-gray-400 hover:bg-gray-600 rounded"
                  >
                    DataTables
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
