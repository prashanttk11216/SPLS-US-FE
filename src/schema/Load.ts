import { z } from "zod";
import { Equipment } from "../enums/Equipment";
import { Mode } from "../enums/Mode";
import { Commodity } from "../enums/Commodity";


// Common schema for Stop objects
const StopSchema = z.object({
  address: z.string().optional(),
  earlyPickupDate: z.string().optional(),
  latePickupDate: z.string().optional(),
  earlyDropoffDate: z.string().optional(),
  lateDropoffDate: z.string().optional(),
});


const originSchema = z.object({
  str: z.string().min(1, { message: "Origin is required" }), // String representation
  lat: z.number().min(-90).max(90).optional().refine((val) => val !== undefined, { message: "Latitude is required" }), // Latitude
  lng: z.number().min(-180).max(180).optional().refine((val) => val !== undefined, { message: "Longitude is required" }), // Longitude
});

const destinationSchema = z.object({
  str: z.string().min(1, { message: "destination is required" }), // String representation
  lat: z.number().min(-90).max(90).optional().refine((val) => val !== undefined, { message: "Latitude is required" }), // Latitude
  lng: z.number().min(-180).max(180).optional().refine((val) => val !== undefined, { message: "Longitude is required" }), // Longitude
});

// Base schema for load operations
const baseLoadSchema = z.object({
  customerId: z.string().optional(),
  brokerId: z.string().optional(),
  carrierId: z.string().optional(),

  origin: originSchema,
  originEarlyPickupDate: z.string({ required_error: "Origin early pickup date is required" }),
  originLatePickupDate: z.string().optional(),
  originEarlyPickupTime: z.string().optional(),
  originLatePickupTime: z.string().optional(),
  originStops: z.array(StopSchema).optional(),

  destination: destinationSchema,
  destinationEarlyDropoffDate: z.string().optional(),
  destinationLateDropoffDate: z.string().optional(),
  destinationEarlyDropoffTime: z.string().optional(),
  destinationLateDropoffTime: z.string().optional(),
  destinationStops: z.array(StopSchema).optional(),

  equipment: z.nativeEnum(Equipment, { required_error: "Equipment is required" }),
  mode: z.nativeEnum(Mode, { required_error: "Mode is required" }),

  allInRate: z.number().min(0, { message: "Rate must be a positive number" }).optional(),
  customerRate: z.number().min(0, { message: "Rate must be a positive number" }).optional(),
  weight: z.number().min(0, { message: "Weight is required and must be a positive number" }).optional(),
  length: z.number().min(0, { message: "Length is required and must be a positive number" }).optional(),
  width: z.number().min(0, { message: "Width is required and must be a positive number" }).optional(),
  height: z.number().min(0, { message: "Height must be a positive number" }).optional(),
  distance: z.number().min(0, { message: "Distance must be a positive number" }).optional(),
  pieces: z.number().min(0, { message: "Pieces must be a positive number" }).optional(),
  pallets: z.number().min(0, { message: "Pallets must be a positive number" }).optional(),
  miles: z.number().min(0, { message: "Miles must be a positive number" }).optional(),
  loadOption: z.string().optional(),
  specialInstructions: z.string().optional(),
  commodity: z.union([z.nativeEnum(Commodity), z.string().max(0)]).optional(),
  loadNumber: z.number().optional(),

  postedBy: z.string().optional(),
  status: z
    .enum([
      "Draft",
      "Published",
      "Pending Response",
      "Negotiation",
      "Assigned",
      "In Transit",
      "Delivered",
      "Completed",
      "Cancelled",
    ])
    .optional(),
});

// Transform logic with explicit type assertions
function cleanData<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== "")
  ) as Partial<T>;
}

// Validation for create operation
export const createLoadSchema = baseLoadSchema.transform((data) => cleanData(data));

// Validation for update operation (all fields optional)
export const updateLoadSchema = baseLoadSchema.omit({ brokerId: true, postedBy: true, customerId: true}).partial().transform((data) => cleanData(data));

