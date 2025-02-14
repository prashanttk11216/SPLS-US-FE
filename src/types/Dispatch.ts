import { DispatchLoadStatus } from "../enums/DispatchLoadStatus";
import { DispatchLoadType } from "../enums/DispatchLoadType";
import { Equipment } from "../enums/Equipment";
import { Consignee } from "./Consignee";
import { Shipper } from "./Shipper";
import { User } from "./User";

export interface IAddress {
  str: string; // String representation
  lat: number; // Latitude
  lng: number; // Longitude
}

export interface IDispatchConsignee {
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

export interface IDispatchShipper {
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

export interface IFsc {
  type: string,
  value: number
}

export interface IOtherChargeBreakdown {
  description: string;
  amount: number;
  isAdvance: boolean;
  date: Date
}

export interface IOtherCharge {
  totalAmount: number;
  breakdown: IOtherChargeBreakdown[];
}

export interface ICarrierFeeBreakdown {
  type: DispatchLoadType,
  rate: number,
  PDs: number,
  fuelServiceCharge: IFsc,
  units: number;
  totalRate: number;
  OtherChargeSchema: IOtherChargeBreakdown[]
}

export interface ICarrierFee {
  totalAmount: number;
  breakdown: ICarrierFeeBreakdown;
}

export interface IDispatch extends Document {
  _id: string;
  brokerId?: string | User;
  loadNumber: number;
  WONumber: string;
  customerId?: string | User;
  carrierId?: string | User;
  salesRep: string | User;
  type: DispatchLoadType;
  units: number,
  PDs: number;
  fuelServiceCharge: IFsc;
  otherCharges: IOtherCharge;
  carrierFee: ICarrierFee
  equipment: Equipment;
  allInRate?: number;
  customerRate?: number;
  consignee: IDispatchConsignee;
  shipper: IDispatchShipper;
  postedBy?: string | User;
  status: DispatchLoadStatus;
  age?: Date;
  formattedAge?: string; // Virtual field
  createdAt?: Date;
  updatedAt?: Date;
}
