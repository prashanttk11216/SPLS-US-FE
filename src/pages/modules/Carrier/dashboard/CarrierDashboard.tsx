import React, { useEffect, useState } from "react";
import "./CarrierDashboard.scss";
import DashboardTile from "../../../../components/common/DashboardTile/DashboardTile";
import useFetchData from "../../../../hooks/useFetchData/useFetchData";
import { getCarrierDashboardData } from "../../../../services/dashboard/dashboardService";

type dashboardStats = {
  dispatchLoadStats:[{
    status: string;
    count: number
  }],
  activeLoads: number,
  completedLoads: number,
  totalTrucks: number,
  totalEarnings:number
}

const CarrierDashboard: React.FC = () => {
  const [stats, setStats] = useState<dashboardStats>({
    dispatchLoadStats:[{
      status: "",
      count: 0
    }],
    activeLoads: 0,
    completedLoads: 0,
    totalTrucks: 0,
    totalEarnings:0
  })

  const { getData } = useFetchData<any>({
    getAll: {
      dashboard: getCarrierDashboardData
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const result = await getData("dashboard");
      if(result.success){
        if (result.data) {
          setStats(result.data as unknown as dashboardStats);
        }
      }
    };
    fetchData();
  }, [])
  return (
    <div>
      <h1>Carrier Dashboard</h1>
      <div>
        <h3>SPLS Dispatch Load Board</h3>
        <div className="dashboard">
          {stats.dispatchLoadStats.length && stats.dispatchLoadStats.map(load => (
            <DashboardTile key={load.count} title={load.status} value={load.count} />
          ))}
        </div>
      </div>
      <div className="dashboard">
        <DashboardTile key={0} title={"Active Loads"} value={stats.activeLoads} />
        <DashboardTile key={1} title={"Completed Loads"} value={stats.completedLoads} />
        <DashboardTile key={2} title={"Total Trucks"} value={stats.totalTrucks} />
        <DashboardTile key={3} title={"Total Earnings"} value={stats.totalEarnings} />
      </div>
    </div>
  );
};

export default CarrierDashboard;