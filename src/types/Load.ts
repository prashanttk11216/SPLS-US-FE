import { Mode } from "fs";
import { Equipment } from "../enums/Equipment";
import { Commodity } from "../enums/Commodity";
import { LoadOption } from "../enums/LoadOption";
import { User } from "./User";

export interface Load {
  _id: string;
  customerId?: string;
  brokerId?: string | User;
  adminId?: string;
  carrierId?: string;
  origin:  {
    str: string; // String representation of the address
    lat: number; // Latitude
    lng: number; // Longitude
  };
  originEarlyPickupDate: Date;
  originLatePickupDate?: Date;
  originEarlyPickupTime?: Date;
  originLatePickupTime?: Date;
  originStops?: {
    address: {
      str: string; // String representation of the address
      lat: number; // Latitude
      lng: number; // Longitude
    };
    earlyPickupDate?: Date;
    latePickupDate?: Date;
    earlyPickupTime?: Date;
    latePickupTime?: Date;
  }[];
  destination:  {
    str: string; // String representation of the address
    lat: number; // Latitude
    lng: number; // Longitude
  };
  destinationEarlyDropoffDate?: Date;
  destinationLateDropoffDate?: Date;
  destinationEarlyDropoffTime?: Date;
  destinationLateDropoffTime?: Date;
  destinationStops?: {
    address: {
      str: string; // String representation of the address
      lat: number; // Latitude
      lng: number; // Longitude
    };
    earlyDropoffDate?: Date;
    lateDropoffDate?: Date;
    earlyDropoffTime?: Date;
    lateDropoffTime?: Date;
  }[];
  equipment: Equipment;
  mode: Mode;
  allInRate?: number;
  customerRate?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  pieces?: number;
  pallets?: number;
  age?: Date;
  formattedAge?: string;
  miles?: number;
  loadOption?: LoadOption;
  specialInstructions?: string;
  commodity: Commodity;
  loadNumber?: number;
  postedBy?:  string | User;
  status: string;
  dhoDistance?: number;
  dhdDistance?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
