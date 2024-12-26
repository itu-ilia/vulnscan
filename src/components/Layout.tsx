import { Outlet, Link } from 'react-router-dom';
import { FiHome, FiList, FiSettings } from 'react-icons/fi';

const Layout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">VulnScan</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            <FiHome className="text-gray-500" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            <FiList className="text-gray-500" />
            <span>All Scans</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            <FiSettings className="text-gray-500" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-500">Vulnerability Scanner Dashboard</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 