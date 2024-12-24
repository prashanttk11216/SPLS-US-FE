
export interface Shipper {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    primaryNumber: string;
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
    shippingHours?: string;
    brokerId: string;
    isDeleted: boolean;
    isAppointments: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}