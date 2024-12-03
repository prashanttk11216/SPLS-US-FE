import Header from "../../../../components/Header/Header"
import { Outlet } from "react-router-dom";
import './CarrierLayout.scss';   



const CarrierLayout = () => {
  return (
    <div className="carrier-dashboard">
      <Header />
      <div className="dashboard-wrapper">
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default CarrierLayout