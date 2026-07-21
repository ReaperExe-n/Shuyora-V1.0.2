import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthModal from './AuthModal';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  const [showModal, setShowModal] = useState(true);

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color, #0b0b0e)' }}>
        <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
        {!showModal && <Navigate to="/" replace />}
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
