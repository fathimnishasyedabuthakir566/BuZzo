import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bus, Menu, X, MapPin, User as UserIcon, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import type { User } from "@/types";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };

    fetchUser();

    // Listen for local updates
    window.addEventListener('user-updated', fetchUser);
    return () => window.removeEventListener('user-updated', fetchUser);
  }, [location.pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/buses", label: "Track Buses" },
    { href: "/about", label: "About" },
  ];

  const getDashboardPath = () => {
    if (!user) return "/auth";
    if (user.role === 'admin') return "/admin";
    if (user.role === 'driver') return "/driver";
    return "/dashboard";
  };

  const getProfilePath = () => {
    if (!user) return "/auth";
    if (user.role === 'driver') return "/driver-profile";
    return "/profile";
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Bus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse-dot" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-foreground">BusTrack</span>
              <span className="text-xs text-muted-foreground block -mt-1">Tirunelveli</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`nav-link text-sm font-medium ${isActive(link.href) ? "text-foreground after:w-full" : ""
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={getDashboardPath()}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to={getProfilePath()}>
                  <Button variant="accent" size="sm" className="rounded-full w-10 h-10 p-0 overflow-hidden border-2 border-primary/20">
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button variant="accent" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-2 px-4">
                {user ? (
                  <>
                    <Link to={getDashboardPath()} className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full gap-2 font-semibold">
                        <LayoutDashboard className="w-4 h-4" />
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link to={getProfilePath()} className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="accent" size="sm" className="w-full gap-2 font-semibold">
                        <UserIcon className="w-4 h-4" />
                        View Profile
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Link to="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth?mode=register" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="accent" size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
