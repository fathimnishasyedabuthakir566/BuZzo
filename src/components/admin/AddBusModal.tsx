import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { busSchema, type BusFormData } from "@/lib/validations/bus";

interface AddBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const AddBusModal = ({ isOpen, onClose, onSubmit }: AddBusModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      name: "",
      busNumber: "",
      routeFrom: "",
      routeTo: "",
      capacity: 40,
      ac: false,
      status: "not-started"
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: BusFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in border border-border shadow-2xl">
        <h2 className="text-xl font-bold text-foreground mb-4">Add New Bus</h2>
        <form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Bus Name
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="e.g., Nellai Express"
              className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Bus Number
            </label>
            <input
              {...register("busNumber")}
              type="text"
              placeholder="e.g., TN 72 AB 1234"
              className={`input-field w-full ${errors.busNumber ? 'border-red-500' : ''}`}
            />
            {errors.busNumber && <p className="text-xs text-red-500 mt-1">{errors.busNumber.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Start Point</label>
              <input {...register("routeFrom")} type="text" placeholder="From" className="input-field w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">End Point</label>
              <input {...register("routeTo")} type="text" placeholder="To" className="input-field w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Depot</label>
              <input {...register("depot")} type="text" placeholder="e.g. Tirunelveli" className="input-field w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Platform No</label>
              <input {...register("platformNumber")} type="number" placeholder="0" className="input-field w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Bus Type</label>
              <select {...register("busType")} className="input-field w-full bg-background">
                <option value="Mofussil">Mofussil</option>
                <option value="Town Bus">Town Bus</option>
                <option value="Express">Express</option>
                <option value="Deluxe">Deluxe</option>
                <option value="AC">AC</option>
                <option value="Ultra Deluxe">Ultra Deluxe</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Service Type</label>
              <select {...register("serviceType")} className="input-field w-full bg-background">
                <option value="Ordinary">Ordinary</option>
                <option value="Express">Express</option>
                <option value="BPR">BPR</option>
                <option value="1to1">1to1</option>
                <option value="Special">Special</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Driver Name</label>
              <input {...register("driverName")} type="text" placeholder="Name" className="input-field w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Driver Phone</label>
              <input {...register("driverPhone")} type="text" placeholder="Phone" className="input-field w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Conductor Name</label>
              <input {...register("conductorName")} type="text" placeholder="Name" className="input-field w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Conductor Phone</label>
              <input {...register("conductorPhone")} type="text" placeholder="Phone" className="input-field w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Capacity</label>
              <input {...register("capacity")} type="number" placeholder="40" className="input-field w-full" />
            </div>
            <div className="flex items-center pt-8">
              <input {...register("ac")} type="checkbox" id="ac" className="mr-2 h-4 w-4" />
              <label htmlFor="ac" className="text-sm font-medium text-foreground">AC Available</label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Bus"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBusModal;
