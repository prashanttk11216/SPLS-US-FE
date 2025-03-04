import Header from "../../../../components/Header/Header";
import Sidebar from "../../../../components/Sidebar/Sidebar";
import HomeIcon from "../../../../assets/icons/home.svg";
import BrokerIcon from "../../../../assets/icons/broker.svg";
import { Outlet } from "react-router-dom";
import "./CustomerLayout.scss";

const CustomerLayout = () => {
  // Dynamically determine visibility based on user's role
  const menuItems = [
    { name: "Dashboard", icon: HomeIcon, path: "/customer", isVisible: true },
    { 
      name: "Load", 
      icon: BrokerIcon, 
      path: "/customer/load-board",
      isVisible: true 
    },
  ];

  return (
    <div className="customer-dashboard">
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

export default CustomerLayout;
