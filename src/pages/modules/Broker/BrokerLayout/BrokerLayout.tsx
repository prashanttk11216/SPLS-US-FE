import Header from "../../../../components/Header/Header";
import Sidebar from "../../../../components/Sidebar/Sidebar";
import HomeIcon from "../../../../assets/icons/home.svg";
import UsersIcon from "../../../../assets/icons/user.svg";
import CarrierIcon from "../../../../assets/icons/carrier.svg";
import BrokerIcon from "../../../../assets/icons/broker.svg";
import { Outlet } from "react-router-dom";
import "./BrokerLayout.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

const BrokerLayout = () => {
  const user = useSelector((state: RootState) => state.user);

  // Dynamically determine visibility based on user's role
  const menuItems = [
    { name: "Dashboard", icon: HomeIcon, path: "/broker", isVisible: true },
    { name: "Customers", icon: UsersIcon, path: "/broker/customers", isVisible: true },
    { name: "Carriers", icon: CarrierIcon, path: "/broker/carriers", isVisible: true },
    { 
      name: "Brokers", 
      icon: BrokerIcon, 
      path: "/broker/broker-users", 
      isVisible: user.role === "broker_admin" // Visible only to broker_admin
    },
    { 
      name: "Shipper", 
      icon: BrokerIcon, 
      path: "/broker/shipper",
      isVisible: true 
    },
    { 
      name: "Consignee", 
      icon: BrokerIcon, 
      path: "/broker/consignee", 
      isVisible: true
    },
  ];

  return (
    <div className="broker-dashboard">
      <Header />
      <div className="dashboard-wrapper">
        <Sidebar menuItems={menuItems} />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BrokerLayout;
