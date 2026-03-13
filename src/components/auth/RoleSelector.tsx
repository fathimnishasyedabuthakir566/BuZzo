import { Users, Shield, Bus } from "lucide-react";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSelector = ({ role, onRoleChange }: RoleSelectorProps) => {
  const roles = [
    { id: "user", label: "Passenger", icon: Users },
    { id: "driver", label: "Driver", icon: Bus },
    { id: "admin", label: "Admin", icon: Shield },
  ];

  return (
    <div className="relative bg-slate-100/50 p-1.5 rounded-[2rem] flex items-center mb-10 overflow-hidden border border-slate-200/50">
      {/* Active Indicator Background */}
      <div 
        className={cn(
          "absolute top-1.5 bottom-1.5 bg-white rounded-[1.75rem] shadow-sm transition-all duration-300 ease-out z-0",
          role === "user" ? "left-1.5 w-[calc(33.33%-4px)]" : 
          role === "driver" ? "left-[33.33%] w-[calc(33.33%-4px)]" : 
          "left-[66.66%] w-[calc(33.33%-4px)]"
        )}
      />
      
      {roles.map((r) => {
        const Icon = r.icon;
        const isActive = role === r.id;
        
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onRoleChange(r.id as UserRole)}
            className={cn(
              "relative z-10 flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all duration-300",
              isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Icon className={cn("w-5 h-5 mb-1 transition-transform duration-300", isActive && "scale-110")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
