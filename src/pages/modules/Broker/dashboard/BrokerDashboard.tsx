import React, { useEffect, useState } from "react";
import "./BrokerDashboard.scss";
import DashboardTile from "../../../../components/common/DashboardTile/DashboardTile";
import useFetchData from "../../../../hooks/useFetchData/useFetchData";
import { getBrokerDashboardData } from "../../../../services/dashboard/dashboardService";
import Loading from "../../../../components/common/Loading/Loading";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../../../utils/numberUtils";

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
  userRoleStats: [
    {
      role: string;
      count: number;
    }
  ];
  totalEarnings: number;
};

const LOAD_ACTIVE_TAB = "LOAD_ACTIVE_TAB";
const DISPATCH_ACTIVE_TAB = "DISPATCH_ACTIVE_TAB";

const BrokerDashboard: React.FC = () => {
  const navigate = useNavigate();
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
    userRoleStats: [
      {
        role: "",
        count: 0,
      },
    ],
    totalEarnings: 0,
  });

  const { getData, loading } = useFetchData<any>({
    getAll: {
      dashboard: getBrokerDashboardData,
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
    localStorage.setItem(LOAD_ACTIVE_TAB, title)
    navigate('load-board')
  }

  const handleDispatchLoadNavigation = (title:string) =>{
    localStorage.setItem(DISPATCH_ACTIVE_TAB, title)
    navigate('dispatch-board')
  }

  const handleUserRolesNavigation = (title:string) => {
    switch (title) {
      case 'Broker User':
        navigate('users')
        break;
      case 'Carriers':
        navigate('carriers')
        break;
      case 'Customers':
        navigate('customers')
        break;
      default:
        break;
    }
  }
  return loading ? (
    <Loading />
  ) : (
    <div>
      <h1>Broker Dashboard</h1>
      <div className="mb-2">
        <h3>SPLS Load Board</h3>
        <div className="dashboard">
          {stats.loadStats.length &&
            stats.loadStats.map((load) => (
              <DashboardTile
                key={load.count}
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
            stats.dispatchLoadStats.map((load) => (
              <DashboardTile
                key={load.count}
                title={load.status}
                value={load.count}
                suffix="loads"
                color="#8073b8"
                handleClick={handleDispatchLoadNavigation}
              />
            ))}
        </div>
      </div>
      <div className="mb-2">
        <h3>SPLS Users Role</h3>
        <div className="dashboard">
          {stats.userRoleStats.length &&
            stats.userRoleStats.map((load) => (
              <DashboardTile
                key={load.count}
                title={
                  load.role === "broker_user"
                    ? "Broker User"
                    : load.role === "carrier"
                    ? "Carriers"
                    : load.role === "customer"
                    ? "Customers"
                    : load.role === "broker_admin"
                    ? "Broker Admin"
                    : ""
                }
                value={load.count}
                color="#ff9800"
                handleClick={handleUserRolesNavigation}
              />
            ))}
        </div>
      </div>
      <div>
        <h3>Total Earnings</h3>
        <div className="dashboard">
          <DashboardTile
            key={stats.totalEarnings}
            title={"Total"}
            value={`$${formatNumber(stats.totalEarnings)}`}
            color="#4caf50"
          />
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;
