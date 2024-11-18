import { Navigate } from "react-router-dom";
import { UserRole } from "../../enums/UserRole";
import { getRoleBasedRoute } from "../../utils/routeHelpers";

interface RoleBaseRoutesProps {
  roles?: UserRole[]; // Array of allowed roles
  children?: React.ReactNode;
}

const RoleBaseRoutes: React.FC<RoleBaseRoutesProps> = ({ roles, children }) => {
  const user = JSON.parse(`${localStorage.getItem("user")}`);

  // Check if the user role is allowed for this route
  const hasRequiredRole = user && user.role && roles?.includes(user.role);

  // If no user data or role, navigate to login
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role if they lack required role
  if (!hasRequiredRole) {
    const roleBasedRoute = getRoleBasedRoute(user.role);
    return <Navigate to={roleBasedRoute} replace />;
  }

  // Render child routes if user has required role
  return <>{children}</>;
};

export default RoleBaseRoutes;
