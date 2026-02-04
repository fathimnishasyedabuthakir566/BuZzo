import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Bus } from "@/types";

interface EditBusModalProps {
    isOpen: boolean;
    bus: Bus | null;
    onClose: () => void;
    onSubmit: (id: string, data: any) => void;
}

const EditBusModal = ({ isOpen, bus, onClose, onSubmit }: EditBusModalProps) => {
    const [formData, setFormData] = useState({
        name: "",
        busNumber: "",
        routeFrom: "",
        routeTo: "",
        capacity: 40,
        ac: false,
        status: ""
    });

    useEffect(() => {
        if (bus) {
            setFormData({
                name: bus.name,
                busNumber: bus.busNumber,
                routeFrom: bus.routeFrom,
                routeTo: bus.routeTo,
                capacity: bus.capacity || 40,
                ac: bus.ac || false,
                status: bus.status
            });
        }
    }, [bus]);

    if (!isOpen || !bus) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(bus.id, formData);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type, checked } = target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in border border-border shadow-2xl">
                <h2 className="text-xl font-bold text-foreground mb-4">Edit Bus</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Bus Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} type="text" required className="input-field w-full" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Bus Number</label>
                            <input name="busNumber" value={formData.busNumber} onChange={handleChange} type="text" required className="input-field w-full" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Start Point</label>
                            <input name="routeFrom" value={formData.routeFrom} onChange={handleChange} type="text" required className="input-field w-full" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">End Point</label>
                            <input name="routeTo" value={formData.routeTo} onChange={handleChange} type="text" required className="input-field w-full" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="input-field w-full bg-background">
                                <option value="on-time">On Time</option>
                                <option value="delayed">Delayed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="offline">Offline</option>
                            </select>
                        </div>
                        <div className="flex items-center pt-8">
                            <input type="checkbox" name="ac" id="acEdit" checked={formData.ac} onChange={handleChange} className="mr-2 h-4 w-4" />
                            <label htmlFor="acEdit" className="text-sm font-medium text-foreground">AC Available</label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="accent" className="flex-1">Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBusModal;
