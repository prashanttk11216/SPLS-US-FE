// src/pages/CustomerDashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlusIcon from "../../../../assets/icons/plus.svg";

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className='d-flex align-items-center'>
      <h3 className='fw-bold'>Quick Load Form</h3>
      <button
          className="btn btn-accent d-flex align-items-center ms-auto"
          type="button"
          onClick={() => navigate(`create`)}
        >
          <img src={PlusIcon} height={16} width={16} className="me-2" />
          Create Load
        </button>
    </div>
  );
};

export default CustomerDashboard;
