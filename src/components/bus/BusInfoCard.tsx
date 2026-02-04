interface BusInfoCardProps {
  busNumber: string;
  capacity: number;
  ac: boolean;
}

const BusInfoCard = ({ busNumber, capacity, ac }: BusInfoCardProps) => {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4">Bus Information</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Bus Number</span>
          <span className="font-medium text-foreground">{busNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Capacity</span>
          <span className="font-medium text-foreground">{capacity} seats</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">AC</span>
          <span className="font-medium text-foreground">
            {ac ? "Yes" : "Non-AC"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BusInfoCard;
