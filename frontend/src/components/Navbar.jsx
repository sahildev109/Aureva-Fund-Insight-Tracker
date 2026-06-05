import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-lg ${
      isActive
        ? 'text-teal-700 bg-teal-50'
        : 'text-gray-500 hover:text-teal-700 hover:bg-teal-50/60'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-teal-700 bg-teal-50 border border-teal-100'
        : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50/60'
    }`;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link
            to="/search"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-white-500 transition-colors">
              <img src="/Aureva-Logo-1.png" alt="" />
            </div>
            <span className="font-black text-gray-900 tracking-tight text-md leading-none">
              Aureva Fund Insight Tracker
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full tracking-wide uppercase leading-none">
              India
            </span>
          </Link>

          {/* Desktop center nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/search" className={navLinkClass}>
              Search
            </NavLink>
            {token && (
              <NavLink to="/watchlist" className={navLinkClass}>
                Watchlist
              </NavLink>
            )}
          </div>

          {/* Desktop right controls */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center">
                    <span className="text-teal-700 font-bold text-xs leading-none">
                      {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    <span className="text-gray-900 font-semibold">{user?.name}</span>
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-100 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-teal-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:text-teal-700 hover:bg-teal-50 focus:outline-none transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        id="mobile-menu"
      >
        <div className="px-4 pt-2 pb-4 space-y-1 border-t border-gray-100 bg-white">
          <NavLink to="/search" onClick={() => setIsOpen(false)} className={mobileNavLinkClass}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </NavLink>
          {token && (
            <NavLink to="/watchlist" onClick={() => setIsOpen(false)} className={mobileNavLinkClass}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Watchlist
            </NavLink>
          )}

          <div className="pt-3 mt-1 border-t border-gray-100">
            {token ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-700 font-bold text-sm leading-none">
                      {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
                    <p className="text-xs text-gray-400 leading-tight">Signed in</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-teal-700 border border-gray-200 hover:border-teal-200 hover:bg-teal-50 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}