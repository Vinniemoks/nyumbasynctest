import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import SkipLink from './SkipLink';

const DashboardLayout = ({ children, role, menuItems }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SkipLink targetId="main-content" />
      <Sidebar role={role} menuItems={menuItems} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-20" role="banner">
          <div className="flex justify-between items-center">
            {/* Title - Hidden on mobile, shown on tablet+ */}
            <h1 className="hidden sm:block text-lg sm:text-2xl font-semibold text-gray-800 ml-12 lg:ml-0">
              Dashboard
            </h1>
            {/* Spacer for mobile to account for menu button */}
            <div className="sm:hidden w-12" aria-hidden="true"></div>
            
            <div className="flex items-center space-x-2 sm:space-x-4" role="region" aria-label="User account controls">
              {/* User info - Responsive */}
              <div className="text-right" aria-label="User information">
                <p className="text-xs sm:text-sm font-medium text-gray-800 truncate max-w-[120px] sm:max-w-none">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize hidden sm:block">{role}</p>
              </div>
              
              {/* Logout button - Touch-friendly */}
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition touch-manipulation flex items-center gap-1 sm:gap-2"
                style={{ minHeight: '44px', minWidth: '44px' }}
                aria-label="Logout from account"
              >
                <LogOut size={16} className="sm:w-4 sm:h-4" aria-hidden="true" />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>
            </div>
          </div>
        </header>
        
        <main id="main-content" className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto" role="main" aria-label="Main content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
