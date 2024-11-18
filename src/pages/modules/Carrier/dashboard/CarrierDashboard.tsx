import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { clearStorage } from '../../../../utils/authHelplers';
import { resetUser } from '../../../../features/user/userSlice';

const CarrierDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const logout = () => {
    clearStorage();
    dispatch(resetUser())
  }

  return (
    <div>
      <h1>Carrier Dashboard</h1>
      <p>Welcome, {user?.firstName} {user?.lastName}</p>
      {/* Add carrier-specific features here */}
      <button className='btn btn-primary' onClick={logout}>logout</button>
    </div>
  );
};

export default CarrierDashboard;
