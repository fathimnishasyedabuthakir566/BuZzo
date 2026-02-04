import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AddBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    name: string;
    busNumber: string;
    routeFrom: string;
    routeTo: string;
    capacity: number;
    ac: boolean;
  }) => void;
}

const AddBusModal = ({ isOpen, onClose, onSubmit }: AddBusModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    busNumber: "",
    routeFrom: "",
    routeTo: "",
    capacity: 40,
    ac: false
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in border border-border shadow-2xl">
        <h2 className="text-xl font-bold text-foreground mb-4">Add New Bus</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Bus Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              type="text"
              required
              placeholder="e.g., Nellai Express"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Bus Number
            </label>
            <input
              name="busNumber"
              value={formData.busNumber}
              onChange={handleChange}
              type="text"
              required
              placeholder="e.g., TN 72 AB 1234"
              className="input-field w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Start Point
              </label>
              <input
                name="routeFrom"
                value={formData.routeFrom}
                onChange={handleChange}
                type="text"
                required
                placeholder="From"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                End Point
              </label>
              <input
                name="routeTo"
                value={formData.routeTo}
                onChange={handleChange}
                type="text"
                required
                placeholder="To"
                className="input-field w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Capacity
              </label>
              <input
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                type="number"
                required
                placeholder="Number of seats"
                className="input-field w-full"
              />
            </div>
            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                name="ac"
                id="acBy"
                checked={formData.ac}
                onChange={handleChange}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="acBy" className="text-sm font-medium text-foreground">AC Available</label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-1">
              Add Bus
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBusModal;
