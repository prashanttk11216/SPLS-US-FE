import Header from "../../../../components/Header/Header"
import { Outlet } from "react-router-dom";
import './CustomerLayout.scss';   

const CustomerLayout = () => {
  return (
    <div className="customer-dashboard">
      <Header />
      <div className="dashboard-wrapper">
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default CustomerLayout