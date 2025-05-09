import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Settings, 
  History, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Camera, 
  AlertTriangle 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/events', label: 'Event Logs', icon: <ClipboardList size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
    { path: '/audit', label: 'Audit Trail', icon: <History size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-20 p-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 focus:outline-none"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Camera size={24} className="text-blue-400" />
            <h1 className="text-xl font-bold">Theatre Security</h1>
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Main</p>
            <div className="mt-4 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="px-4 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Account</p>
            <div className="mt-4 space-y-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <LogOut size={20} />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <h1 className="text-xl font-semibold text-gray-800 lg:hidden">
              Theatre Security
            </h1>
            <div className="flex items-center space-x-4">
              <button className="relative p-1 text-gray-600 hover:text-gray-900 focus:outline-none">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="hidden lg:block">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {user?.username}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;