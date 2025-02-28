import React from "react";
import "./DashboardTile.scss";

interface DashboardTileProps {
  title: string;
  value: string | number;
}

const DashboardTile: React.FC<DashboardTileProps> = ({ title, value }) => {
  return (
    <div className="dashboard-tile">
      <div className="dashboard-tile-content">
        <h3 className="dashboard-tile-title">{title}</h3>
        <p className="dashboard-tile-value">{value}</p>
      </div>
    </div>
  );
};

export default DashboardTile;