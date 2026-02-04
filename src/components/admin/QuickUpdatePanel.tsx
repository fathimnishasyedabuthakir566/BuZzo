import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Bus } from "@/types";

interface QuickUpdatePanelProps {
  buses: Bus[];
  onUpdate?: (busId: string, data: { currentLocation: string; eta: string }) => void;
}

const QuickUpdatePanel = ({ buses, onUpdate }: QuickUpdatePanelProps) => {
  const [selectedBusId, setSelectedBusId] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [eta, setEta] = useState("");

  useEffect(() => {
    if (buses.length > 0 && !selectedBusId) {
      setSelectedBusId(buses[0].id);
    }
  }, [buses, selectedBusId]);

  const handleUpdate = () => {
    if (!selectedBusId || !currentLocation || !eta) return;
    onUpdate?.(selectedBusId, { currentLocation, eta });
    // Reset fields after update
    setCurrentLocation("");
    setEta("");
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Location Update</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Select Bus
          </label>
          <select
            className="input-field"
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
          >
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.name} - {bus.busNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Current Location
          </label>
          <input
            type="text"
            placeholder="Enter current location"
            className="input-field"
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            ETA to Destination
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 10 mins"
              className="input-field flex-1"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
            />
            <Button
              variant="accent"
              onClick={handleUpdate}
              disabled={!selectedBusId || !currentLocation || !eta}
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickUpdatePanel;
