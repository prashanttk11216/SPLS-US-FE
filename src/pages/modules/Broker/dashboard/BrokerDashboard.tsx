import React, { useEffect, useState } from "react";
import "./BrokerDashboard.scss";
import DashboardTile from "../../../../components/common/DashboardTile/DashboardTile";
import useFetchData from "../../../../hooks/useFetchData/useFetchData";
import { getBrokerDashboardData } from "../../../../services/dashboard/dashboardService";

type dashboardStats = {
  loadStats:[{
    status: string;
    count: number
  }],
  dispatchLoadStats:[{
    status: string;
    count: number
  }],
  userRoleStats:[{
    role: string;
    count: number
  }],
  totalEarnings:number
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
    userRoleStats:[{
      role: "",
      count: 0
    }],
    totalEarnings:0
  })

  const { getData } = useFetchData<any>({
    getAll: {
      dashboard: getBrokerDashboardData
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
            <DashboardTile key={load.count} title={load.status} value={`${load.count} (loads)`} />
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
      <div className="mb-2">
        <h3>SPLS Users Role</h3>
        <div className="dashboard">
          {stats.userRoleStats.length && stats.userRoleStats.map(load => (
            <DashboardTile 
              key={load.count} 
              title={
                load.role === 'broker_user' 
                  ? 'Broker User' 
                  : load.role === 'carrier' 
                  ? 'Carrier' 
                  : load.role === 'customer'
                  ? 'Customer'
                  : load.role === 'broker_admin'
                  ? 'Broker Admin'
                  : ''
                } 
              value={load.count} 
            />
          ))}
        </div>
      </div>
      <div>
        <h3>Total Earnings</h3>
        <div className="dashboard">
          <DashboardTile key={stats.totalEarnings} title={"Total"} value={stats.totalEarnings} />
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;



