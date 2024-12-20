import { Equipment } from "../enums/Equipment";
import { User } from "./User";

export interface Truck {
  _id: string;
  brokerId?: string | User;
  origin: {
    str: string; // String representation of the origin
    lat: number; // Latitude of the origin
    lng: number; // Longitude of the origin
  };
  availableDate: Date; // Early pickup date for the origin

  destination: {
    str: string; // String representation of the destination
    lat: number; // Latitude of the destination
    lng: number; // Longitude of the destination
  };

  equipment: Equipment; // Type of equipment used (enum)

  allInRate?: number; // All-inclusive rate (optional, minimum value 0)
  weight?: number; // Weight of the load (optional, minimum value 0)
  length?: number; // Length of the load (optional, minimum value 0)
  miles?: number; // Miles for the load (optional, minimum value 0)
  comments?: string; // Any special instructions for the load
  referenceNumber?: number; // Unique reference number for the load

  postedBy?: string | User; // Reference to the user who posted the load
  age?: Date; // Persistent age field

  // Virtual properties
  formattedAge?: string; // Human-readable age (e.g., "2d", "3h", etc.)
}
