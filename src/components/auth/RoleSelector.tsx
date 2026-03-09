import { Users, Shield, Bus } from "lucide-react";
import type { UserRole } from "@/types";

interface RoleSelectorProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSelector = ({ role, onRoleChange }: RoleSelectorProps) => {
  return (
    <div className="flex gap-2 p-1 bg-secondary rounded-xl mb-6 overflow-x-auto">
      <button
        type="button"
        onClick={() => onRoleChange("user")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${role === "user"
          ? "bg-card text-foreground shadow-md"
          : "text-muted-foreground hover:text-foreground"
          }`}
      >
        <Users className="w-4 h-4" />
        Passenger
      </button>
      <button
        type="button"
        onClick={() => onRoleChange("driver")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${role === "driver"
          ? "bg-card text-foreground shadow-md"
          : "text-muted-foreground hover:text-foreground"
          }`}
      >
        <Bus className="w-4 h-4" />
        Bus Driver
      </button>
      <button
        type="button"
        onClick={() => onRoleChange("admin")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${role === "admin"
          ? "bg-card text-foreground shadow-md"
          : "text-muted-foreground hover:text-foreground"
          }`}
      >
        <Shield className="w-4 h-4" />
        Admin
      </button>
    </div>
  );
};

export default RoleSelector;
