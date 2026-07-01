import React from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPets from './pages/MyPets';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Search from './pages/Search';
import PetDetails from './pages/PetDetails';
import SavedPets from './pages/SavedPets';
import Profile from './pages/Profile';
import './App.css';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/discover" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Layout>
            <Routes>
              <Route
                path="/"
                element={
                  <PublicOnlyRoute>
                    <Home />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/sobre" element={<Home />} />
              <Route path="/about" element={<Home />} />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <Register />
                  </PublicOnlyRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/discover"
                element={
                  <ProtectedRoute>
                    <Discover />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matches"
                element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-pets"
                element={
                  <ProtectedRoute>
                    <MyPets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedPets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pets/:id"
                element={
                  <ProtectedRoute>
                    <PetDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/location"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Navigate to="/profile/location" replace />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
