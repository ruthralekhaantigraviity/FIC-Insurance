import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import LeadManagement from './views/LeadManagement';
import ActivityReporting from './views/ActivityReporting';
import EmployeeManagement from './views/EmployeeManagement';
import AnnouncementManagement from './views/AnnouncementManagement';
import TaskManagement from './views/TaskManagement';
import Incentives from './views/Incentives';
import Payments from './views/Payments';
import Policies from './views/Policies';
import PerformanceReports from './views/PerformanceReports';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return <DashboardLayout>{children}</DashboardLayout>;
};

const LeadsPage = () => {
  const { user } = useContext(AuthContext);
  return user?.role === 'employee' ? <ActivityReporting /> : <LeadManagement />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leads" 
            element={
              <ProtectedRoute>
                <LeadsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employees" 
            element={
              <ProtectedRoute>
                <EmployeeManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/announcements" 
            element={
              <ProtectedRoute>
                <AnnouncementManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <TaskManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/incentives" 
            element={
              <ProtectedRoute>
                <Incentives />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/policies" 
            element={
              <ProtectedRoute>
                <Policies />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/performance-reports" 
            element={
              <ProtectedRoute>
                <PerformanceReports />
              </ProtectedRoute>
            } 
          />
          {/* Add more routes here later */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </AuthProvider>
    </Router>
  );
}

export default App;
