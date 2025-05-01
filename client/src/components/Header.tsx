import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Brain, Home, Network, MessageSquare, LogOut } from 'lucide-react';

interface HeaderProps {
  user: string | null;
  onLogout: () => void;
}

const Header = ({ user, onLogout }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-lg font-bold gradient-text">Knowledge Graph</span>
            </Link>
          </div>

          {user ? (
            <>
              {/* Desktop navigation */}
              <nav className="hidden md:flex items-center space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/knowledge-graph"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/knowledge-graph'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Knowledge Graph
                </Link>
                <Link
                  to="/chat"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/chat'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Chat
                </Link>
                <div className="pl-4 ml-4 border-l border-gray-300 flex items-center">
                  <span className="text-sm text-gray-700 mr-3">Hello, {user}</span>
                  <button
                    onClick={onLogout}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </button>
                </div>
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div>
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 hover:underline"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && user && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Dashboard
              </div>
            </Link>
            <Link
              to="/knowledge-graph"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/knowledge-graph'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <Network className="mr-2 h-5 w-5" />
                Knowledge Graph
              </div>
            </Link>
            <Link
              to="/chat"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/chat'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat
              </div>
            </Link>
            <button
              onClick={() => {
                closeMenu();
                onLogout();
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              <div className="flex items-center">
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </div>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
