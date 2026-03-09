
import { MapPin, Bus as BusIcon, Route, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Bus } from "@/types";
import { useNavigate } from "react-router-dom";

interface BusEntryCardProps {
    bus: Bus;
}

const BusEntryCard = ({ bus }: BusEntryCardProps) => {
    const navigate = useNavigate();

    const getBusTypeColor = (type: string | undefined) => {
        switch (type) {
            case "AC": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Deluxe": return "bg-purple-100 text-purple-800 border-purple-200";
            case "Express": return "bg-orange-100 text-orange-800 border-orange-200";
            case "Ultra Deluxe": return "bg-indigo-100 text-indigo-800 border-indigo-200";
            case "SFS": return "bg-pink-100 text-pink-800 border-pink-200";
            default: return "bg-slate-100 text-slate-800 border-slate-200";
        }
    };

    const getServiceTypeBadge = (type: string | undefined) => {
        if (!type) return null;
        return (
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 opacity-80">
                {type}
            </Badge>
        );
    };

    // Ensure scheduledTimes is always an array
    const scheduledTimes = Array.isArray(bus.scheduledTime)
        ? bus.scheduledTime
        : bus.scheduledTime
            ? [bus.scheduledTime]
            : [];

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary group bg-white dark:bg-slate-900 h-full flex flex-col">
            <CardHeader className="p-4 pb-2 bg-gradient-to-r from-transparent to-primary/5">
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getBusTypeColor(bus.busType)}`}>
                                {bus.busType || 'Bus'}
                            </span>
                            {bus.isActive && (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase font-black px-1.5 py-0.5 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                                    Live
                                </Badge>
                            )}
                            {getServiceTypeBadge(bus.serviceType)}
                            <span className="text-xs font-mono font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                {bus.busNumber}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors flex items-center flex-wrap gap-1">
                                {bus.routeTo}
                            </h3>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                from {bus.routeFrom}
                            </span>
                        </div>
                    </div>

                    <div className="text-right shrink-0 bg-primary/10 p-2 rounded-xl">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Departs</span>
                            <span className="text-xl font-black text-foreground tracking-tight leading-none">
                                {scheduledTimes[0] || '--:--'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3 flex-grow">
                {/* Route Info */}
                <div className="flex items-start gap-2.5 text-sm">
                    <Route className="w-4 h-4 mt-0.5 shrink-0 text-primary/60" />
                    <div className="flex-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-0.5">Via Route</span>
                        <span className="text-foreground leading-snug block">
                            {bus.via && bus.via.length > 0 ? bus.via.join(" → ") : "Direct Route"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-lg border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Platform</span>
                            <span className="text-sm font-semibold">{bus.platformNumber || '-'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-lg border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <BusIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Depot</span>
                            <span className="text-sm font-semibold truncate max-w-[80px]" title={bus.depot}>{bus.depot || 'Tn'}</span>
                        </div>
                    </div>
                </div>

                {/* Timings Preview */}
                {scheduledTimes.length > 1 && (
                    <div className="pt-3 border-t border-dashed mt-auto">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-bold text-muted-foreground uppercase">Upcoming Departures</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {scheduledTimes.slice(1, 6).map((time, idx) => (
                                <span key={idx} className="bg-secondary text-secondary-foreground text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-border">
                                    {time}
                                </span>
                            ))}
                            {scheduledTimes.length > 6 && (
                                <span className="text-[10px] text-muted-foreground self-center pl-1">
                                    +{scheduledTimes.length - 6} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-3 pt-0 mt-auto">
                <Button
                    className="w-full h-10 rounded-xl font-semibold shadow-sm hover:shadow group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                    variant="outline"
                    onClick={() => navigate(`/bus/${bus.id}`)}
                >
                    <Info className="w-4 h-4 mr-2" />
                    Track Live Status
                </Button>
            </CardFooter>
        </Card>
    );
};

export default BusEntryCard;
