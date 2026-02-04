import { Users, Shield } from "lucide-react";
import type { UserRole } from "@/types";

interface RoleSelectorProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSelector = ({ role, onRoleChange }: RoleSelectorProps) => {
  return (
    <div className="flex gap-2 p-1 bg-secondary rounded-xl mb-6">
      <button
        onClick={() => onRoleChange("user")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
          role === "user"
            ? "bg-card text-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Users className="w-4 h-4" />
        Passenger
      </button>
      <button
        onClick={() => onRoleChange("admin")}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
          role === "admin"
            ? "bg-card text-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Shield className="w-4 h-4" />
        Bus Operator
      </button>
    </div>
  );
};

export default RoleSelector;
