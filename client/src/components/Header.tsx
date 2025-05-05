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
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Brain className="h-8 w-8 text-white" />
              <span className="ml-2 text-lg font-bold gradient-text">PotentiAlly</span>
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
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/knowledge-graph"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/knowledge-graph'
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Knowledge Graph
                </Link>
                <Link
                  to="/chat"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/chat'
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Chat
                </Link>
                <div className="pl-4 ml-4 border-l border-white/30 flex items-center">
                  <span className="text-sm text-white mr-3">Hello, {user}</span>
                  <button
                    onClick={onLogout}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10 hover:text-red-300"
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
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-white/10"
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
                className="text-white hover:text-white/80 hover:underline"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && user && (
        <div className="md:hidden bg-white/10 border-t border-white/20 backdrop-blur-md animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/'
                  ? 'bg-white/20 text-white'
                  : 'text-white hover:bg-white/10'
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
                  ? 'bg-white/20 text-white'
                  : 'text-white hover:bg-white/10'
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
                  ? 'bg-white/20 text-white'
                  : 'text-white hover:bg-white/10'
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
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 hover:text-red-300"
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
