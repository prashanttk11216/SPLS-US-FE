import { UserRole } from "../enums/UserRole";

// Helper function to map user roles to their respective routes
export const getRoleBasedRoute = (role: UserRole): string => {
  switch (role) {
    case UserRole.BROKER_ADMIN:
    case UserRole.BROKER_USER:
      return "/broker";
    case UserRole.CARRIER:
      return "/carrier";
    case UserRole.CUSTOMER:
      return "/customer";
    case UserRole.CONSIGNEE:
      return "/consignee";
    default:
      return "/"; // Default route for undefined roles
  }
};
