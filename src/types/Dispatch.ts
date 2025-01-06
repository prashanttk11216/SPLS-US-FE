import { Equipment } from "../enums/Equipment";
import { Consignee } from "./Consignee";
import { Shipper } from "./Shipper";
import { User } from "./User";

export interface IAddress {
  str: string; // String representation
  lat: number; // Latitude
  lng: number; // Longitude
}

export interface IConsignee {
  consigneeId: string | Consignee;
  address: IAddress;
  date: Date;
  time?: Date;
  description?: string;
  type?: string;
  qty?: number;
  weight?: number;
  value?: number;
  notes?: string;
  PO?: number;
}

export interface IShipper {
  shipperId: string | Shipper;
  address: IAddress;
  date: Date;
  time?: Date;
  description?: string;
  type?: string;
  qty?: number;
  weight?: number;
  value?: number;
  notes?: string;
  PO?: number;
}

export interface IDispatch extends Document {
  _id: string;
  brokerId?: string | User;
  loadNumber: number;
  WONumber: number;
  customerId?: string | User;
  carrierId?: string | User;
  equipment: Equipment;
  allInRate?: number;
  customerRate?: number;
  carrierRate?: number;
  consignee: IConsignee;
  shipper: IShipper;
  postedBy?: string | User;
  status: "Draft" | "Published" | "Pending Response" | "Deal Closed" | "Cancelled";
  age?: Date;
  formattedAge?: string; // Virtual field
  createdAt?: Date;
  updatedAt?: Date;
}
