import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DriverCardProps {
  driverName: string;
  driverPhone: string;
  rating?: number;
  status?: "Driving" | "Break" | "Trip Completed";
}

const DriverCard = ({ driverName, driverPhone, rating = 4.8, status = "Driving" }: DriverCardProps) => {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[3rem] -mr-4 -mt-4 transition-colors group-hover:bg-slate-100"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-black shadow-xl ring-4 ring-slate-50">
            {driverName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Captain</span>
               <div className="w-1 h-1 rounded-full bg-slate-300"></div>
               <span className={cn(
                 "text-[9px] font-black px-1.5 py-0.5 rounded uppercase",
                 status === "Driving" ? "bg-emerald-100 text-emerald-700" :
                 status === "Break" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
               )}>
                 {status}
               </span>
            </div>
            <h3 className="font-black text-slate-800 text-lg leading-tight mb-1">{driverName}</h3>
            <div className="flex items-center gap-1">
               <span className="text-yellow-400 font-bold text-sm">★</span>
               <span className="text-sm font-black text-slate-700">{rating}</span>
               <span className="text-[10px] text-slate-400 font-bold ml-1">RATING</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
           <a href={`tel:${driverPhone}`} className="block">
              <Button variant="hero" className="w-full rounded-2xl h-14 text-sm font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                <Phone className="w-4 h-4 mr-2" />
                Establish Contact
              </Button>
           </a>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
