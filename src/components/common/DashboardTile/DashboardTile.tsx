import React from "react";
import "./DashboardTile.scss";

interface DashboardTileProps {
  title: string;
  value: string | number;
  suffix?: string;
  color?: string;
  handleClick?: (value: any) => void;
}

const DashboardTile: React.FC<DashboardTileProps> = ({
  title,
  value,
  suffix,
  color,
  handleClick,
}) => {
  return (
    <div
      className="dashboard-tile"
      style={{cursor: handleClick && 'pointer'}}
      onClick={() => handleClick && handleClick(title)}
    >
      <div className="dashboard-tile-content">
        <h3 className="dashboard-tile-title">{title}</h3>
        <p
          className="dashboard-tile-value"
          style={{ color: color || "#007bff" }}
        >
          {value}
          {suffix && <span className="suffix">({suffix})</span>}
        </p>
      </div>
    </div>
  );
};

export default DashboardTile;
