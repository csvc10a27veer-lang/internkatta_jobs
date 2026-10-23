// frontend/src/App.jsx

import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { UserAuthProvider } from './context/UserAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { LoadingProvider } from './context/LoadingContext';
import Preloader from './components/Preloader';
import { useLoading } from './context/LoadingContext';
import { migrateAuthData } from './utils/authMigration';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { CandidateProfileProvider } from './context/CandidateProfileContext';

import SecurityQuestionModal from './components/SecurityQuestionModal';

function AppContent() {
  const { isLoading } = useLoading();

  return (
    <>
      <AppRoutes />
      {isLoading && <Preloader />}
      <SecurityQuestionModal />
    </>
  );
}

function App() {
  useEffect(() => {
    migrateAuthData();
  }, []);

  return (
    <UserAuthProvider>
      <CandidateProfileProvider>
        <AdminAuthProvider>
          <SocketProvider>
            <CartProvider>
              <LoadingProvider>
                <AppContent />
              </LoadingProvider>
            </CartProvider>
          </SocketProvider>
        </AdminAuthProvider>
      </CandidateProfileProvider>
    </UserAuthProvider>
  );
}

export default App;