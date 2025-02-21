import { useMemo } from "react";
import Header from "../../../../components/Header/Header";
import Sidebar from "../../../../components/Sidebar/Sidebar";
import HomeIcon from "../../../../assets/icons/home.svg";
import SettingIcon from "../../../../assets/icons/setting.svg";
import UsersIcon from "../../../../assets/icons/user.svg";
import CarrierIcon from "../../../../assets/icons/carrier.svg";
import BrokerIcon from "../../../../assets/icons/broker.svg";
import { Outlet } from "react-router-dom";
import "./BrokerLayout.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { UserRole } from "../../../../enums/UserRole";
import { hasAccess } from "../../../../utils/permissions";
import Loading from "../../../../components/common/Loading/Loading";

const BrokerLayout = () => {
  const user = useSelector((state: RootState) => state.user);

  // Wait until user roles are available before initializing menuItems
  const menuItems = useMemo(() => {
    if (!user) return [];

    return [
      { name: "Dashboard", icon: HomeIcon, path: "/broker", isVisible: true },
      { name: "Load", icon: BrokerIcon, path: "/broker/load-board", isVisible: true },
      { name: "Dispatch Load", icon: BrokerIcon, path: "/broker/dispatch-board", isVisible: true },
      {
        name: "Accounting",
        icon: SettingIcon,
        path: "/broker/accounting-manager",
        isVisible: true,
        subMenu: [
          { name: "Accounting Manager", icon: BrokerIcon, path: "/broker/accounting-manager", isVisible: true },
          { name: "Accounting Summary", icon: BrokerIcon, path: "/broker/accounting-summary", isVisible: true },
          { name: "Accounting Exports", icon: BrokerIcon, path: "/broker/accounting-exports", isVisible: true },
        ],
      },
      {
        name: "Sales Manager",
        icon: SettingIcon,
        path: "/broker/customer-dashboard",
        isVisible: true,
        subMenu: [
          { name: "Customer Dashboard", icon: BrokerIcon, path: "/broker/customer-dashboard", isVisible: true },
          { name: "Quote Status", icon: BrokerIcon, path: "/broker/quote-status", isVisible: true },
        ],
      },
      { name: "Reports", icon: BrokerIcon, path: "/broker/reports", isVisible: true },
      {
        name: "Settings",
        icon: SettingIcon,
        path: "/broker/shipper",
        isVisible: true,
        subMenu: [
          { name: "Shipper", icon: BrokerIcon, path: "/broker/shipper", isVisible: true },
          { name: "Consignee", icon: BrokerIcon, path: "/broker/consignee", isVisible: true },
          { name: "Customers", icon: UsersIcon, path: "/broker/customers", isVisible: true },
          { name: "Carriers", icon: CarrierIcon, path: "/broker/carriers", isVisible: true },
          {
            name: "Users",
            icon: UsersIcon,
            path: "/broker/users",
            isVisible: hasAccess(user.roles, { roles: [UserRole.BROKER_ADMIN] }),
          },
          {
            name: "Roles",
            icon: UsersIcon,
            path: "/broker/roles",
            isVisible: hasAccess(user.roles, { roles: [UserRole.BROKER_ADMIN] }),
          },
        ],
      },
    ];
  }, [user]); // Recalculate when `user.roles` changes

  // Show a loading state while user roles are not available
  if (!user) {
    return <Loading /> // Replace with a spinner or skeleton loader if needed
  }

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
