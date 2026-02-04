import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DriverCardProps {
  driverName: string;
  driverPhone: string;
}

const DriverCard = ({ driverName, driverPhone }: DriverCardProps) => {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4">Driver</h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">
            {driverName.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-medium text-foreground">{driverName}</p>
          <p className="text-sm text-muted-foreground">Driver</p>
        </div>
      </div>
      <a href={`tel:${driverPhone}`}>
        <Button variant="outline" className="w-full">
          <Phone className="w-4 h-4" />
          Contact Driver
        </Button>
      </a>
    </div>
  );
};

export default DriverCard;
