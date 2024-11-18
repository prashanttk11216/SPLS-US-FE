import Header from "../../../../components/Header/Header";
import Sidebar from "../../../../components/Sidebar/Sidebar";
import HomeIcon from "../../../../assets/icons/home.svg";
import UsersIcon from "../../../../assets/icons/user.svg";
import CarrierIcon from "../../../../assets/icons/carrier.svg";
import BrokerIcon from "../../../../assets/icons/broker.svg";
import { Outlet } from "react-router-dom";
import "./BrokerLayout.scss";

const menuItems = [
  { name: "Dashboard", icon: HomeIcon, path: "/broker" },
  { name: "Customers", icon: UsersIcon, path: "/broker/customers" },
  { name: "Carriers", icon: CarrierIcon, path: "/broker/carriers" },
  { name: "Brokers", icon: BrokerIcon, path: "/broker/brokers" },
];

const BrokerLayout = () => {
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
