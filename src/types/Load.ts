import { Commodity } from "../enums/Commodity";
import { Equipment } from "../enums/Equipment";
import { Mode } from "fs";
import { LoadStatus } from "../enums/LoadStatus";
import { LoadOption } from "../enums/LoadOption";
import { User } from "./User";

interface Location {
  str: string;
  lat: number;
  lng: number;
}
export interface Load {
  _id?: string;
  origin: Location;
  originEarlyPickupDate: Date;
  originLatePickupDate?: Date;
  originEarlyPickupTime?: Date;
  originLatePickupTime?: Date;
  originStops?: {
    address: Location;
    earlyPickupDate?: Date;
    latePickupDate?: Date;
    earlyPickupTime?: Date;
    latePickupTime?: Date;
  }[];


  destination: Location
  destinationEarlyDropoffDate?: Date;
  destinationLateDropoffDate?: Date;
  destinationEarlyDropoffTime?: Date;
  destinationLateDropoffTime?: Date;
  destinationStops?: {
    address: Location;
    earlyDropoffDate?: Date;
    lateDropoffDate?: Date;
    earlyDropoffTime?: Date;
    lateDropoffTime?: Date;
  }[];

  equipment: Equipment;
  mode: Mode;
  commodity?: Commodity;
  loadOption?: LoadOption;
  status?: LoadStatus;

  allInRate?: number;
  customerRate?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  pieces?: number;
  pallets?: number;
  miles?: number;
  dhoDistance?: number;
  dhdDistance?: number;
  loadNumber: number;


  specialInstructions?: string;
  formattedAge?: string;


  age?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  customerId?: string | User;
  brokerId?: string | User;
  carrierId?: string | User;
  postedBy?: string | User;
}