import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import LoadList from '../Load/LoadList/LoadList';


const CarrierDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  return (
    <div className='load-list-wrapper'>
      <LoadList />
    </div>
  );

};

export default CarrierDashboard;
