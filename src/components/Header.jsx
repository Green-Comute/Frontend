import { useNavigate, useLocation } from "react-router-dom";
import { Leaf, LogOut } from "lucide-react";
import { authService } from "../services/authService";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate("/", { replace: true });
    // Force page reload to clear all state
    window.location.reload();
  };

  const hideHeaderRoutes = ["/login", "/signup"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  if (shouldHideHeader) return null;

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-90 transition"
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-stone-800">
            GreenCommute
          </span>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-stone-700 hover:text-emerald-700 font-medium transition"
              >
                Sign In
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-stone-700 hover:text-emerald-700 font-medium transition"
              >
                Dashboard
              </button>

              <button
                onClick={() => navigate("/passenger/search")}
                className="text-stone-700 hover:text-emerald-700 font-medium transition"
              >
                Find Rides
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
