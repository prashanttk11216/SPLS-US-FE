import { z } from "zod";

// Define a schema for loadForm
export const loadFormSchema = z.object({
  _id: z.string().optional(),
  origin: z.string(),
  originEarlyPickupDate: z.string(),
  originLatePickupDate: z.string().optional(),
  originEarlyPickupTime: z.string().optional(),
  originLatePickupTime: z.string().optional(),
  originStops: z
    .array(
      z.object({
        address: z.string(),
        earlyPickupDate: z.string().optional(),
        latePickupstring: z.string().optional(),
        earlyPickupTime: z.string().optional(),
        latePickupTime: z.string().optional(),
      })
    )
    .optional(),
  destination: z.string(),
  destinationEarlyDropoffDate: z.string().optional(),
  destinationLateDropoffDate: z.string().optional(),
  destinationEarlyDropoffTime: z.string().optional(),
  destinationLateDropoffTime: z.string().optional(),
  destinationStops: z
    .array(
      z.object({
        address: z.string(),
        earlyDropoffDate: z.string().optional(),
        lateDropoffDate: z.string().optional(),
        earlyDropoffTime: z.string().optional(),
        lateDropoffTime: z.string().optional(),
      })
    )
    .optional(),
  equipment: z.string(),
  mode: z.string(),
  allInRate: z.number().optional(),
  customerRate: z.number().optional(),
  weight: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  distance: z.number().optional(),
  pieces: z.number().optional(),
  pallets: z.number().optional(),
  loadOption: z.string().optional(),
  specialInstructions: z.string().optional(),
  commodity: z.string().optional(),
  loadNumber: z.number().optional(),
  postedBy: z.string().optional(),
  status: z.enum(['Draft', 
    'Published', 
    'Pending Response', 
    'Negotiation', 
    'Assigned', 
    'In Transit', 
    'Delivered', 
    'Completed', 
    'Cancelled']).optional(),
  });


