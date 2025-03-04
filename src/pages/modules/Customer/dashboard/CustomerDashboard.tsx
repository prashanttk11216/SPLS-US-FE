import React, { useEffect, useState } from "react";
import "./CustomerDashboard.scss";
import DashboardTile from "../../../../components/common/DashboardTile/DashboardTile";
import useFetchData from "../../../../hooks/useFetchData/useFetchData";
import { getCustomerDashboardData } from "../../../../services/dashboard/dashboardService";

type dashboardStats = {
  loadStats:[{
    status: string;
    count: number
  }],
  dispatchLoadStats:[{
    status: string;
    count: number
  }],
  totalLoads: number;
  activeLoads: number;
  completedLoads: number;
}

const BrokerDashboard: React.FC = () => {
  const [stats, setStats] = useState<dashboardStats>({
    loadStats:[{
      status: "",
      count: 0
    }],
    dispatchLoadStats:[{
      status: "",
      count: 0
    }],
    totalLoads: 0,
    activeLoads: 0,
    completedLoads: 0
  })

  const { getData } = useFetchData<any>({
    getAll: {
      dashboard: getCustomerDashboardData
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
      <h1>Broker Dashboard</h1>
      <div className="mb-2">
        <h3>SPLS Load Board</h3>
        <div className="dashboard">
          {stats.loadStats.length && stats.loadStats.map(load => (
            <DashboardTile key={load.count} title={load.status} value={load.count} />
          ))}
        </div>
      </div>
      <div className="mb-2">
        <h3>SPLS Dispatch Load Board</h3>
        <div className="dashboard">
          {stats.dispatchLoadStats.length && stats.dispatchLoadStats.map(load => (
            <DashboardTile key={load.count} title={load.status} value={load.count} />
          ))}
        </div>
      </div>
      <div>
        <h3>Stats</h3>
        <div className="dashboard">
          <DashboardTile key={0} title={"Total Loads"} value={stats.totalLoads} />
          <DashboardTile key={1} title={"Active Loads"} value={stats.activeLoads} />
          <DashboardTile key={2} title={"Completed Loads"} value={stats.completedLoads} />
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;