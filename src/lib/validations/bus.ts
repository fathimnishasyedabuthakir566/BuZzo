import * as z from "zod";

export const busSchema = z.object({
    name: z.string().min(2, "Bus name must be at least 2 characters"),
    busNumber: z.string().min(2, "Bus number is required"),
    routeFrom: z.string().min(2, "Start point must be at least 2 characters"),
    routeTo: z.string().min(2, "End point must be at least 2 characters"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1").max(100, "Capacity cannot exceed 100"),
    ac: z.boolean().default(false),
    status: z.enum(["on-time", "delayed", "arriving", "departed", "unavailable", "completed", "not-started"]).optional(),
    platformNumber: z.coerce.number().min(0).max(50).optional(),
    busType: z.enum(['Town Bus', 'Mofussil', 'Express', 'Deluxe', 'AC', 'Ultra Deluxe', 'SFS']).optional(),
    serviceType: z.enum(['Ordinary', 'Express', 'Special', '1to1', 'EAC', 'BPR']).optional(),
    depot: z.string().optional(),
    via: z.array(z.string()).optional(),
    driverName: z.string().optional(),
    driverPhone: z.string().optional(),
    conductorName: z.string().optional(),
    conductorPhone: z.string().optional(),
});

export type BusFormData = z.infer<typeof busSchema>;
