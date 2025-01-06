import Header from "../../../../components/Header/Header";
import Sidebar from "../../../../components/Sidebar/Sidebar";
import HomeIcon from "../../../../assets/icons/home.svg";
import BrokerIcon from "../../../../assets/icons/broker.svg";
import { Outlet } from "react-router-dom";
import "./CarrierLayout.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

const CarrierLayout = () => {
  const user = useSelector((state: RootState) => state.user);

  // Dynamically determine visibility based on user's role
  const menuItems = [
    { name: "Dashboard", icon: HomeIcon, path: "/carrier", isVisible: true },
    { 
      name: "Load", 
      icon: BrokerIcon, 
      path: "/carrier/load-board",
      isVisible: true 
    },
    { 
      name: "Truck", 
      icon: BrokerIcon, 
      path: "/carrier/truck",
      isVisible: true 
    },
  ];

  return (
    <div className="carrier-dashboard">
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

export default CarrierLayout;
