import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Bus, LayoutDashboard, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";

interface AdminSidebarProps {
  activeTab?: string;
  userName?: string;
  userRole?: string;
}

const AdminSidebar = ({
  userName = "User",
  userRole = "Bus Operator"
}: AdminSidebarProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('view') || 'dashboard';

  const handleLogout = async () => {
    await authService.logout();
    navigate("/auth");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin?view=dashboard" },
    { id: "buses", label: "My Buses", icon: Bus, href: "/admin?view=buses" },
    { id: "location", label: "Update Location", icon: MapPin, href: "/admin?view=location" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
            <Bus className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">BusTrack</span>
            <span className="text-xs text-muted-foreground block -mt-1">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="font-bold text-foreground">{userName.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
