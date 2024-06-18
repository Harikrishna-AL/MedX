import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
    <FaSpinner className="animate-spin" />
  </div>
);

export default LoadingSpinner;
