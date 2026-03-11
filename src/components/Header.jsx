import { useState, useEffect, useRef, startTransition } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Leaf, LogOut, Menu, X } from "lucide-react";
import { authService } from "../services/authService";

const NavLink = ({ to, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <button
      onClick={() => navigate(to)}
      className={`text-sm font-medium transition-colors duration-200 px-1 py-0.5
        ${isActive
          ? "text-emerald-700 border-b-2 border-emerald-600"
          : "text-stone-600 hover:text-emerald-700"
        }`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </button>
  );
};

const MobileNavLink = ({ to, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <button
      onClick={() => navigate(to)}
      className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
        ${isActive
          ? "bg-emerald-50 text-emerald-700"
          : "text-stone-700 hover:bg-stone-100"
        }`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </button>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = authService.isAuthenticated();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    startTransition(() => setMobileOpen(false));
  }, [location.pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/", { replace: true });
    window.location.reload();
  };

  const hideHeaderRoutes = ["/login", "/signup"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  if (shouldHideHeader) return null;

  return (
    <header
      className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm"
      role="banner"
      ref={menuRef}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            aria-label="GreenCommute home"
          >
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-800 hidden xs:inline">
              GreenCommute
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {!isLoggedIn ? (
              <>
                <NavLink to="/login">Sign In</NavLink>
                <button
                  onClick={() => navigate("/signup")}
                  className="btn-primary text-sm"
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/passenger/search">Find Rides</NavLink>
                <NavLink to="/rewards">Rewards</NavLink>
                <NavLink to="/gamification/leaderboard">Leaderboard</NavLink>
                <NavLink to="/safety">Safety</NavLink>
                <NavLink to="/support/tickets">Support</NavLink>

                <div className="w-px h-6 bg-stone-200 mx-1" aria-hidden="true" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden border-t border-stone-100 py-3 pb-4 animate-fade-in"
            role="menu"
          >
            {!isLoggedIn ? (
              <div className="space-y-1 px-1">
                <MobileNavLink to="/login">Sign In</MobileNavLink>
                <div className="pt-2 px-4">
                  <button
                    onClick={() => navigate("/signup")}
                    className="btn-primary w-full text-sm"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 px-1">
                <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
                <MobileNavLink to="/passenger/search">Find Rides</MobileNavLink>
                <MobileNavLink to="/rewards">Rewards</MobileNavLink>
                <MobileNavLink to="/gamification/leaderboard">Leaderboard</MobileNavLink>
                <MobileNavLink to="/safety">Safety</MobileNavLink>
                <MobileNavLink to="/support/tickets">Support</MobileNavLink>
                <div className="border-t border-stone-100 mt-2 pt-2 px-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
