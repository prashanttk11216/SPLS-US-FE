import React from "react";
import Header from "../../../../components/Header/Header";
import Sidebar from "../../../../components/Sidebar/Sidebar";

import "./BrokerDashboard.scss";
import { Outlet } from "react-router-dom";



const BrokerDashboard: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Broker Dashboard!</h1>
      <p>Here is your dashboard content.</p>
    </div>
  );
};

export default BrokerDashboard;



