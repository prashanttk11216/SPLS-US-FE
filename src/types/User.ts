import { UserRole } from "../enums/UserRole";

export interface User {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  primaryNumber: string;
  role?: UserRole;
  company?: string;
  isVerified?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  avatarUrl?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  // Primary address

  address?: {
    str: string; // String representation of the address
    lat: number; // Latitude
    lng: number; // Longitude
  };
  addressLine2?: string;
  addressLine3?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;

  // Billing-specific fields (only for customers)
  billingAddress?: {
    str: string; // String representation of the address
    lat: number; // Latitude
    lng: number; // Longitude
  };
  billingAddressLine2?: string;
  billingAddressLine3?: string;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingZip?: string;

  // Broker and regulatory details
  brokerId?: string; // Reference to the broker (if applicable)
}
