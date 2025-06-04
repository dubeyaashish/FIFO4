import React from 'react';
import loadingSvg from '../pages/Loading.svg';

const LoadingSpinner = ({ size = '60px' }) => (
  <div
    className="text-center my-4 d-flex justify-content-center align-items-center"
    style={{ height: size }}
  >
    <img src={loadingSvg} alt="Loading..." style={{ height: size, width: size }} />
  </div>
);

export default React.memo(LoadingSpinner);
