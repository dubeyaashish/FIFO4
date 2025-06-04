import React from 'react';
import { Spinner } from 'react-bootstrap';
import styles from '../styles/styles';

const LoadingSpinner = () => {
  return (
    <div style={{ ...styles.spinnerContainer, textAlign: 'center', padding: '20px' }}>
      <Spinner animation="border" role="status" variant="primary" />
      <span style={{ marginLeft: '10px' }}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;