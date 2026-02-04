import { Bus, Power, Clock, Navigation } from "lucide-react";
import type { Bus as BusType } from "@/types";

interface AdminStatsProps {
  buses: BusType[];
}

const AdminStats = ({ buses }: AdminStatsProps) => {
  const stats = [
    {
      icon: Bus,
      value: buses.length,
      label: "Total Buses",
      color: "text-accent",
    },
    {
      icon: Power,
      value: buses.filter((b) => b.isActive).length,
      label: "Active Today",
      color: "text-success",
    },
    {
      icon: Clock,
      value: buses.filter((b) => b.status === "on-time").length,
      label: "On Time",
      color: "text-info",
    },
    {
      icon: Navigation,
      value: buses.filter((b) => b.status === "delayed").length,
      label: "Delayed",
      color: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="glass-card rounded-xl p-4">
          <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
