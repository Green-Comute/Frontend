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
import TestMockTrip from './pages/driver/TestMockTrip';

// Epic-2 Passenger Pages
import SearchTrips from './pages/passenger/SearchTrips';
import PassengerTripTracking from './pages/passenger/PassengerTripTracking';

// Epic-3 ESG / Impact Pages
import MyImpact from './pages/impact/MyImpact';
import OrgEsgDashboard from './pages/esg/OrgEsgDashboard';
import PlatformEsgDashboard from './pages/esg/PlatformEsgDashboard';

// Epic-4 Gamification & Rewards
import PointsHistory from './pages/gamification/PointsHistory';
import TierProgress from './pages/gamification/TierProgress';
import Leaderboard from './pages/gamification/Leaderboard';
import RewardsCatalog from './pages/rewards/RewardsCatalog';
import MyRedemptions from './pages/rewards/MyRedemptions';
import PrivacySettings from './pages/settings/PrivacySettings';
// Admin
import RewardsCRUD from './pages/admin/RewardsCRUD';
import RedemptionQueue from './pages/admin/RedemptionQueue';
import TierConfigPage from './pages/admin/TierConfig';
import AdminUserView from './pages/admin/AdminUserView';
import AdminAllTrips from './pages/admin/AdminAllTrips';
// Platform
import PointRulesDashboard from './pages/platform/PointRulesDashboard';

// Epic-5 Privacy, Safety & Feedback
import RateTrip from './pages/trip/RateTrip';
import PublicTripTracking from './pages/trip/PublicTripTracking';
import SafetyHub from './pages/safety/SafetyHub';
import SafetyGuidelines from './pages/safety/SafetyGuidelines';
import SupportTickets from './pages/support/SupportTickets';
import IncidentReview from './pages/admin/IncidentReview';
import GuidelinesAdmin from './pages/admin/GuidelinesAdmin';

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
          
          {/* Epic-3 Impact / ESG Routes */}
          <Route
            path="/impact/my"
            element={
              <ProtectedRoute>
                <MyImpact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/org-admin/esg"
            element={
              <ProtectedRoute role="ORG_ADMIN">
                <OrgEsgDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/platform/esg"
            element={
              <ProtectedRoute role="PLATFORM_ADMIN">
                <PlatformEsgDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/test-mock"
            element={
              <ProtectedRoute>
                <TestMockTrip />
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

          {/* Epic-4 User Routes */}
          <Route path="/gamification/history" element={<ProtectedRoute><PointsHistory /></ProtectedRoute>} />
          <Route path="/gamification/tier" element={<ProtectedRoute><TierProgress /></ProtectedRoute>} />
          <Route path="/gamification/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><RewardsCatalog /></ProtectedRoute>} />
          <Route path="/rewards/my" element={<ProtectedRoute><MyRedemptions /></ProtectedRoute>} />
          <Route path="/settings/privacy" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />

          {/* Epic-4 Admin Routes */}
          <Route path="/admin/rewards" element={<ProtectedRoute role="ORG_ADMIN"><RewardsCRUD /></ProtectedRoute>} />
          <Route path="/admin/redemptions" element={<ProtectedRoute role="ORG_ADMIN"><RedemptionQueue /></ProtectedRoute>} />
          <Route path="/admin/tiers" element={<ProtectedRoute role="ORG_ADMIN"><TierConfigPage /></ProtectedRoute>} />
          <Route path="/admin/user/:id" element={<ProtectedRoute><AdminUserView /></ProtectedRoute>} />
          <Route path="/admin/trips" element={<ProtectedRoute><AdminAllTrips /></ProtectedRoute>} />

          <Route path="/platform/point-rules" element={<ProtectedRoute role="PLATFORM_ADMIN"><PointRulesDashboard /></ProtectedRoute>} />

          {/* Epic-5 Privacy, Safety & Feedback */}
          {/* Public — no auth needed */}
          <Route path="/track/:token" element={<PublicTripTracking />} />

          {/* Authenticated user routes */}
          <Route path="/trip/:tripId/rate" element={<ProtectedRoute><RateTrip /></ProtectedRoute>} />
          <Route path="/safety" element={<ProtectedRoute><SafetyHub /></ProtectedRoute>} />
          <Route path="/safety/guidelines" element={<ProtectedRoute><SafetyGuidelines /></ProtectedRoute>} />
          <Route path="/support/tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin/incidents" element={<ProtectedRoute role="ORG_ADMIN"><IncidentReview /></ProtectedRoute>} />
          <Route path="/admin/guidelines" element={<ProtectedRoute role="ORG_ADMIN"><GuidelinesAdmin /></ProtectedRoute>} />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
