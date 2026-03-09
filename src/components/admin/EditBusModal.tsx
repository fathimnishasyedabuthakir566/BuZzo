import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Bus } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { busSchema, type BusFormData } from "@/lib/validations/bus";

interface EditBusModalProps {
    isOpen: boolean;
    bus: Bus | null;
    onClose: () => void;
    onSubmit: (id: string, data: Partial<Bus>) => Promise<void>;
}

const EditBusModal = ({ isOpen, bus, onClose, onSubmit }: EditBusModalProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<BusFormData>({
        resolver: zodResolver(busSchema),
    });

    useEffect(() => {
        if (bus) {
            reset({
                name: bus.name,
                busNumber: bus.busNumber,
                routeFrom: bus.routeFrom,
                routeTo: bus.routeTo,
                capacity: bus.capacity || 40,
                ac: bus.ac || false,
                status: bus.status,
                platformNumber: bus.platformNumber,
                busType: bus.busType,
                serviceType: bus.serviceType,
                depot: bus.depot,
                driverName: bus.driverName,
                driverPhone: bus.driverPhone,
                conductorName: bus.conductorName,
                conductorPhone: bus.conductorPhone
            });
        }
    }, [bus, reset]);

    if (!isOpen || !bus) return null;

    const onFormSubmit = async (data: BusFormData) => {
        // @ts-ignore - status type mismatch in older types vs z
        await onSubmit(bus.id, data);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in border border-border shadow-2xl">
                <h2 className="text-xl font-bold text-foreground mb-4">Edit Bus</h2>
                <form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Bus Name</label>
                            <input
                                {...register("name")}
                                type="text"
                                className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Bus Number</label>
                            <input
                                {...register("busNumber")}
                                type="text"
                                className={`input-field w-full ${errors.busNumber ? 'border-red-500' : ''}`}
                            />
                            {errors.busNumber && <p className="text-xs text-red-500 mt-1">{errors.busNumber.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Start Point</label>
                            <input
                                {...register("routeFrom")}
                                type="text"
                                className={`input-field w-full ${errors.routeFrom ? 'border-red-500' : ''}`}
                            />
                            {errors.routeFrom && <p className="text-xs text-red-500 mt-1">{errors.routeFrom.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">End Point</label>
                            <input
                                {...register("routeTo")}
                                type="text"
                                className={`input-field w-full ${errors.routeTo ? 'border-red-500' : ''}`}
                            />
                            {errors.routeTo && <p className="text-xs text-red-500 mt-1">{errors.routeTo.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Depot</label>
                            <input {...register("depot")} type="text" className="input-field w-full" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Platform No</label>
                            <input {...register("platformNumber")} type="number" className="input-field w-full" />
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
                            <input {...register("driverName")} type="text" className="input-field w-full" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Driver Phone</label>
                            <input {...register("driverPhone")} type="text" className="input-field w-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Conductor Name</label>
                            <input {...register("conductorName")} type="text" className="input-field w-full" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Conductor Phone</label>
                            <input {...register("conductorPhone")} type="text" className="input-field w-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                            <select {...register("status")} className="input-field w-full bg-background">
                                <option value="on-time">On Time</option>
                                <option value="delayed">Delayed</option>
                                <option value="completed">Completed</option>
                                <option value="not-started">Not Started</option>
                            </select>
                        </div>
                        <div className="flex items-center pt-8">
                            <input {...register("ac")} type="checkbox" id="acEdit" className="mr-2 h-4 w-4" />
                            <label htmlFor="acEdit" className="text-sm font-medium text-foreground">AC Available</label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" variant="accent" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBusModal;
