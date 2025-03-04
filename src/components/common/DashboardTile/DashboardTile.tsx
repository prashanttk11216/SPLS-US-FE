import React from "react";
import "./DashboardTile.scss";

interface DashboardTileProps {
  title: string;
  value: string | number;
  currency?: string;
  suffix?: string;
  color?: string;
  handleClick?: (value:any) => void
}

const DashboardTile: React.FC<DashboardTileProps> = ({
  title,
  value,
  currency,
  suffix,
  color,
  handleClick
}) => {
  return (
    <div className="dashboard-tile" onClick={handleClick}>
      <div className="dashboard-tile-content">
        <h3 className="dashboard-tile-title">{title}</h3>
        <p
          className="dashboard-tile-value"
          style={{ color: color || "#007bff" }}
        >
          {currency && <span className="currency">{currency}</span>}
          {value}
          {suffix && <span className="suffix">({suffix})</span>}
        </p>
      </div>
    </div>
  );
};

export default DashboardTile;
