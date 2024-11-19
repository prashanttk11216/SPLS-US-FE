import { UserRole } from "../enums/UserRole";

export interface User {
    _id: string; 
    employeeId: string,
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    role?: UserRole;
    company?: string;
    accessLevel?: 'full' | 'limited'; // Only applicable for broker users
    isVerified?: boolean;
    isActive?: boolean;
    isDeleted?: boolean;
    avatarUrl?: string;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}