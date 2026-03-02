import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Epic-1 Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AwaitingApproval from "./pages/AwaitingApproval";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDriverRequests from "./pages/AdminDriverRequests";
import DriverUpload from "./pages/DriverUpload";

// Epic-2 Driver Pages
import CreateTrip from './pages/driver/CreateTrip';
import RideRequests from './pages/driver/RideRequests';
import ActiveTrip from './pages/driver/ActiveTrip';

// Epic-2 Passenger Pages
import SearchTrips from './pages/passenger/SearchTrips';
import PassengerTripTracking from './pages/passenger/PassengerTripTracking';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/awaiting-approval" element={<AwaitingApproval />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Authenticated but profile may be incomplete */}
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />

          {/* Fully protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/driver-requests"
            element={
              <ProtectedRoute role="ORG_ADMIN">
                <AdminDriverRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver/upload"
            element={
              <ProtectedRoute>
                <DriverUpload />
              </ProtectedRoute>
            }
          />

          {/* Epic-2 Driver Routes */}
          <Route 
            path="/driver/create-trip" 
            element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver/requests" 
            element={
              <ProtectedRoute>
                <RideRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver/trip/:tripId" 
            element={
              <ProtectedRoute>
                <ActiveTrip />
              </ProtectedRoute>
            } 
          />
          
          {/* Epic-2 Passenger Routes */}
          <Route 
            path="/passenger/search" 
            element={
              <ProtectedRoute>
                <SearchTrips />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/passenger/ride/:rideId" 
            element={
              <ProtectedRoute>
                <PassengerTripTracking />
              </ProtectedRoute>
            } 
          />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
