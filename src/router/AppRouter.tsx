import { createBrowserRouter } from "react-router-dom";
import { UserRole } from "../enums/UserRole";
import CustomerDashboard from "../pages/modules/Customer/dashboard/CustomerDashboard";
import BrokerDashboard from "../pages/modules/Broker/dashboard/BrokerDashboard";
import CarrierDashboard from "../pages/modules/Carrier/dashboard/CarrierDashboard";
import ProtectedRoutes from "../components/ProtectedRoutes/ProtectedRoutes";
import RoleBaseRoutes from "../components/RoleBaseRoutes/RoleBaseRoutes";
import ErrorPage from "../components/common/ErrorPage/ErrorPage";
import Login from "../pages/Auth/Login/Login";
import Signup from "../pages/Auth/Signup/Signup";
import ForgotPassword from "../pages/Auth/Forgot/ForgotPassword";
import PageNotFound from "../components/common/PageNotFound/PageNotFound";
import Profile from "../pages/modules/Broker/Profile/Profile";
import CustomerList from "../pages/modules/Broker/Customer/CustomerList/CustomerList";
import CarrierList from "../pages/modules/Broker/Carrier/CarrierList/CarrierList";
import BrokerLayout from "../pages/modules/Broker/BrokerLayout/BrokerLayout";
import CustomerLayout from "../pages/modules/Customer/CustomerLayout/CustomerLayout";
import CarrierLayout from "../pages/modules/Carrier/CarrierLayout/CarrierLayout";
import BrokerUserList from "../pages/modules/Broker/BrokerUser/BrokerUserList/BrokerUserList";

// Define the routes using createBrowserRouter
export const routes = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes />, // Protected route that checks for authentication
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <RoleBaseRoutes />,
      },
      // Customer Dashboard Route
      {
        path: "/customer",
        element: <RoleBaseRoutes roles={[UserRole.CUSTOMER]}  children={<CustomerLayout/>}/>,
        children: [
          {
            path: "", // Matches /customer
            element: <CustomerDashboard />,
          },
        ],
      },
      // Broker Dashboard Route
      {
        path: "/broker",
        element: (
          <RoleBaseRoutes
            roles={[UserRole.BROKER_USER, UserRole.BROKER_ADMIN]} children={<BrokerLayout/>}
          />
        ),
        children: [
          {
            path: "", // Matches /broker
            element: <BrokerDashboard />, 
          },
          {
            path: "profile", // Matches /broker
            element: <Profile />,
          },
          {
            path: "customers", // Matches /broker
            element: <CustomerList />,
          },
          {
            path: "carriers", // Matches /broker
            element: <CarrierList />,
          },
          {
            path: "broker-users", // Matches /broker
            element: <BrokerUserList />,
          },
        ],
      },
      // Carrier Dashboard Route
      {
        path: "/carrier",
        element: <RoleBaseRoutes roles={[UserRole.CARRIER]} children={<CarrierLayout/>} />,
        children: [
          {
            path: "", // Matches /carrier
            element: <CarrierDashboard />,
          },
        ],
      },
    ],
  },
  // Public Routes
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup role={UserRole.CUSTOMER} />, // Pass the role to the Signup component
  },
  // As per client discussion, brokers should not have a self-signup option.
  // Only the main admin can add, edit, or deactivate brokers.
  // {
  //   path: "broker/signup",
  //   element: <Signup role={UserRole.BROKER_ADMIN}/>,
  // },
  {
    path: "carrier/signup",
    element: <Signup role={UserRole.CARRIER} />,
  },
  {
    path: "forgot",
    element: <ForgotPassword />,
  },
  { path: "*", element: <PageNotFound /> },
]);
