import React, { useEffect, useState } from "react";
import "./CustomerDashboard.scss";
import DashboardTile from "../../../../components/common/DashboardTile/DashboardTile";
import useFetchData from "../../../../hooks/useFetchData/useFetchData";
import { getCustomerDashboardData } from "../../../../services/dashboard/dashboardService";
import Loading from "../../../../components/common/Loading/Loading";
import { useNavigate } from "react-router-dom";

type dashboardStats = {
  loadStats: [
    {
      status: string;
      count: number;
    }
  ];
  dispatchLoadStats: [
    {
      status: string;
      count: number;
    }
  ];
  totalLoads: number;
  activeLoads: number;
  completedLoads: number;
};

const CUSTOMER_LOADS_ACTIVE_TAB = "CUSTOMER_LOADS_ACTIVE_TAB";

const BrokerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<dashboardStats>({
    loadStats: [
      {
        status: "",
        count: 0,
      },
    ],
    dispatchLoadStats: [
      {
        status: "",
        count: 0,
      },
    ],
    totalLoads: 0,
    activeLoads: 0,
    completedLoads: 0,
  });

  const { getData, loading } = useFetchData<any>({
    getAll: {
      dashboard: getCustomerDashboardData,
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
    localStorage.setItem(CUSTOMER_LOADS_ACTIVE_TAB, title)
    navigate('load-board')
  }

  return loading ? (
    <Loading />
  ) : (
    <div>
      <h1>Customer Dashboard</h1>
      <div className="mb-2">
        <h3>SPLS Load Board</h3>
        <div className="dashboard">
          {stats.loadStats.length &&
            stats.loadStats.map((load, index) => (
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
                color="#8073b8"
              />
            ))}
        </div>
      </div>
      <div>
        <h3>Stats</h3>
        <div className="dashboard">
          <DashboardTile
            key={"Stats" + 1}
            title={"Total Loads"}
            value={stats.totalLoads}
            suffix="loads"
            color="#ff9800"
          />
          <DashboardTile
            key={"Stats" + 2}
            title={"Active Loads"}
            value={stats.activeLoads}
            suffix="loads"
            color="#ff9800"
          />
          <DashboardTile
            key={"Stats" + 3}
            title={"Completed Loads"}
            value={stats.completedLoads}
            suffix="loads"
            color="#ff9800"
          />
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;
