import React from "react";
import "./BrokerDashboard.scss";
import DashboardTile from "../../../../components/common/DashboardTile/DashboardTile";

const BrokerDashboard: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Broker Dashboard!</h1>
      <h3>SPLS Load Board</h3>
      <div className="dashboard">
        <DashboardTile title="Total Users" value={1500} />
        <DashboardTile title="Active Orders" value={320} />
        <DashboardTile title="Revenue" value="$12,500" />
        <DashboardTile title="Total Users" value={1500} />
        <DashboardTile title="Completed Orders" value={1200} />
        <DashboardTile title="Pending Orders" value={80} />
        <DashboardTile title="Cancelled Orders" value={30} />
        <DashboardTile title="New Users" value={50} />
      </div>
    </div>
  );
};

export default BrokerDashboard;



