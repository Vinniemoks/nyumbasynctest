import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Sidebar = ({ role, menuItems }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed at top */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors touch-manipulation"
        style={{ minWidth: '44px', minHeight: '44px' }}
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="sidebar-navigation"
      >
        {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-navigation"
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gray-900 text-white min-h-screen p-4 sm:p-6
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mb-6 sm:mb-8 pt-12 lg:pt-0">
          <h2 className="text-xl sm:text-2xl font-bold">NyumbaSync</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 capitalize" aria-label={`${role} portal`}>{role} Portal</p>
        </div>
        
        <nav aria-label="Primary navigation">
          <ul className="space-y-1 sm:space-y-2" role="list">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`
                      flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg transition
                      touch-manipulation
                      ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 active:bg-gray-700'
                      }
                    `}
                    style={{ minHeight: '44px' }}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <i className={`${item.icon} text-base sm:text-lg`} aria-hidden="true"></i>
                    <span className="text-sm sm:text-base">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
