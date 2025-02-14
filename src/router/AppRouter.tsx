import { createBrowserRouter } from "react-router-dom";
import { UserRole } from "../enums/UserRole";
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
import VerifyUser from "../pages/Auth/VerifyUser/VerifyUser";
import ShipperList from "../pages/modules/Broker/Shipper/ShipperList/ShipperList";
import ConsigneeList from "../pages/modules/Broker/Consignee/ConsigneeList/ConsigneeList";
import BrokerLoadList from "../pages/modules/Broker/Load/LoadList/LoadList";
import CreateOrEditLoad from "../pages/modules/Broker/Load/CreateOrEditLoad/CreateOrEditLoad";
import CustomerCreateOrEditLoad from "../pages/modules/Customer/Load/CreateOrEditLoad/CreateOrEditLoad";
import CustomerLoadList from "../pages/modules/Customer/Load/LoadList/LoadList";
import CarrierLoadList from "../pages/modules/Carrier/Load/LoadList/LoadList";
import TruckList from "../pages/modules/Carrier/Truck/TruckList/TruckList";
import TruckMatches from "../pages/modules/Broker/Load/TruckMatches/TruckMatches";
import DispatchLoadList from "../pages/modules/Broker/DispatchLoad/DispatchLoadList/DispatchLoadList";
import CreateOrEditDispatchLoad from "../pages/modules/Broker/DispatchLoad/CreateOrEditDispatchLoad/CreateOrEditDispatchLoad";
import RoleList from "../pages/modules/Broker/Role/RoleList/RoleList";

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
            element: <CustomerLoadList />,
          },
          {
            path: "load-board/create/:loadId?",
            element: <CustomerCreateOrEditLoad />
          },
          {
            path: "profile", // Matches /customer/profile
            element: <Profile />, // Add the Customer Profile component here
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
            path: "load-board", // Matches /broker
            element: <BrokerLoadList />,
          },
          {
            path: "load-board/create/:loadId?",
            element: <CreateOrEditLoad />
          },
          {
            path: "dispatch-board", // Matches /broker
            element: <DispatchLoadList />,
          },
          {
            path: "dispatch-board/create/:loadId?",
            element: <CreateOrEditDispatchLoad />
          },
          {
            path: "truck/matches/:loadId",
            element: <TruckMatches />
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
            path: "users", // Matches /broker
            element: <BrokerUserList />,
          },
          {
            path: "shipper",
            element: <ShipperList />,
          },
          {
            path: "consignee", 
            element: <ConsigneeList />,
          },
          {
            path: "roles", // Matches /broker
            element: <RoleList />,
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
          {
            path: "profile", // Matches /carrier/profile
            element: <Profile />, // Carrier Profile
          },
          {
            path: "load-board", // Matches /broker
            element: <CarrierLoadList />,
          },
          {
            path: "truck", // Matches /broker
            element: <TruckList />,
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
  {
    path: "verify",
    element: <VerifyUser />,
  },
  { path: "*", element: <PageNotFound /> },
]);
