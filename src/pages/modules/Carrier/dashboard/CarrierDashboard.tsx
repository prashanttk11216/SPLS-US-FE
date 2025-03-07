import React, { useEffect, useState } from "react";
import "./CarrierDashboard.scss";
import DashboardTile from "../../../../components/common/DashboardTile/DashboardTile";
import useFetchData from "../../../../hooks/useFetchData/useFetchData";
import { getCarrierDashboardData } from "../../../../services/dashboard/dashboardService";
import Loading from "../../../../components/common/Loading/Loading";
import { formatNumber } from "../../../../utils/numberUtils";
import { useNavigate } from "react-router-dom";

type dashboardStats = {
  dispatchLoadStats: [
    {
      status: string;
      count: number;
    }
  ];
  activeLoads: number;
  completedLoads: number;
  totalTrucks: number;
  totalEarnings: number;
};

const CARRIER_LOADS_ACTIVE_TAB = "CARRIER_LOADS_ACTIVE_TAB"

const CarrierDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<dashboardStats>({
    dispatchLoadStats: [
      {
        status: "",
        count: 0,
      },
    ],
    activeLoads: 0,
    completedLoads: 0,
    totalTrucks: 0,
    totalEarnings: 0,
  });

  const { getData, loading } = useFetchData<any>({
    getAll: {
      dashboard: getCarrierDashboardData,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const result = await getData("dashboard");
      if (result.success) {
        if (result.data) {
          setStats(result.data as unknown as dashboardStats);
        }
      }
    };
    fetchData();
  }, []);

  const handleLoadNavigation = (title:string) =>{
    localStorage.setItem(CARRIER_LOADS_ACTIVE_TAB, title)
    navigate('load-board')
  }

  const handleTruckLoadNavigation = () =>{
    navigate('truck')
  }

  return loading ? (
    <Loading />
  ) : (
    <div>
      <h1>Carrier Dashboard</h1>
      <div className="mb-2">
        <h3>SPLS Dispatch Load Board</h3>
        <div className="dashboard">
          {stats.dispatchLoadStats.length &&
            stats.dispatchLoadStats.map((load, index) => (
              <DashboardTile
                key={index}
                title={load.status}
                value={load.count}
                suffix="loads"
                handleClick={handleLoadNavigation}
              />
            ))}
        </div>
      </div>
      <div>
        <h3>Stats</h3>
        <div className="dashboard">
          <DashboardTile
            title={"Active Loads"}
            value={stats.activeLoads}
            suffix="loads"
            color="#ff9800"
            handleClick={handleTruckLoadNavigation}
          />
          <DashboardTile
            title={"Completed Loads"}
            value={stats.completedLoads}
            suffix="loads"
            color="#ff9800"
            handleClick={handleTruckLoadNavigation}
          />
          <DashboardTile
            title={"Total Trucks"}
            value={stats.totalTrucks}
            suffix="loads"
            color="#ff9800"
            handleClick={handleTruckLoadNavigation}
          />
          <DashboardTile
            title={"Total Earnings"}
            value={`$${formatNumber(stats.totalEarnings)}`}
            color="#4caf50"
          />
        </div>
      </div>
    </div>
  );
};

export default CarrierDashboard;
