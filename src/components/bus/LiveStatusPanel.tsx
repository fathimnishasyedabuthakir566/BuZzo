import { Bus, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bus as BusType } from "@/types";

interface LiveStatusPanelProps {
    buses: BusType[];
    className?: string;
}

const LiveStatusPanel = ({ buses, className }: LiveStatusPanelProps) => {
    const stats = {
        total: buses.length,
        live: buses.filter(b => b.isActive).length,
        delayed: buses.filter(b => b.status === 'delayed').length,
        onTime: buses.filter(b => b.status === 'on-time' || b.status === 'active').length
    };

    return (
        <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
            <div className="glass-card p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Bus className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-black text-foreground">{stats.total}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Fleet</p>
                </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-500 delay-75">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <div className="relative">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                </div>
                <div>
                    <p className="text-2xl font-black text-emerald-600">{stats.live}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Live Now</p>
                </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-500 delay-150">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-black text-amber-600">{stats.onTime}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">On Schedule</p>
                </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-black text-rose-600">{stats.delayed}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Delayed</p>
                </div>
            </div>
        </div>
    );
};

export default LiveStatusPanel;
