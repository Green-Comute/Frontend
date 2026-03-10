import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Shared loading fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="spinner" />
  </div>
);

// Epic-1 Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AwaitingApproval = lazy(() => import("./pages/AwaitingApproval"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminDriverRequests = lazy(() => import("./pages/AdminDriverRequests"));
const DriverUpload = lazy(() => import("./pages/DriverUpload"));

// Epic-2 Driver Pages
const CreateTrip = lazy(() => import('./pages/driver/CreateTrip'));
const RideRequests = lazy(() => import('./pages/driver/RideRequests'));
const ActiveTrip = lazy(() => import('./pages/driver/ActiveTrip'));
const TestMockTrip = lazy(() => import('./pages/driver/TestMockTrip'));

// Epic-2 Passenger Pages
const SearchTrips = lazy(() => import('./pages/passenger/SearchTrips'));
const PassengerTripTracking = lazy(() => import('./pages/passenger/PassengerTripTracking'));

// Epic-3 ESG / Impact Pages
const MyImpact = lazy(() => import('./pages/impact/MyImpact'));
const OrgEsgDashboard = lazy(() => import('./pages/esg/OrgEsgDashboard'));
const PlatformEsgDashboard = lazy(() => import('./pages/esg/PlatformEsgDashboard'));

// Epic-4 Gamification & Rewards
const PointsHistory = lazy(() => import('./pages/gamification/PointsHistory'));
const TierProgress = lazy(() => import('./pages/gamification/TierProgress'));
const Leaderboard = lazy(() => import('./pages/gamification/Leaderboard'));
const RewardsCatalog = lazy(() => import('./pages/rewards/RewardsCatalog'));
const MyRedemptions = lazy(() => import('./pages/rewards/MyRedemptions'));
const PrivacySettings = lazy(() => import('./pages/settings/PrivacySettings'));
// Admin
const RewardsCRUD = lazy(() => import('./pages/admin/RewardsCRUD'));
const RedemptionQueue = lazy(() => import('./pages/admin/RedemptionQueue'));
const TierConfigPage = lazy(() => import('./pages/admin/TierConfig'));
const AdminUserView = lazy(() => import('./pages/admin/AdminUserView'));
const AdminAllTrips = lazy(() => import('./pages/admin/AdminAllTrips'));
// Platform
const PointRulesDashboard = lazy(() => import('./pages/platform/PointRulesDashboard'));

// Epic-5 Privacy, Safety & Feedback
const RateTrip = lazy(() => import('./pages/trip/RateTrip'));
const PublicTripTracking = lazy(() => import('./pages/trip/PublicTripTracking'));
const SafetyHub = lazy(() => import('./pages/safety/SafetyHub'));
const SafetyGuidelines = lazy(() => import('./pages/safety/SafetyGuidelines'));
const SupportTickets = lazy(() => import('./pages/support/SupportTickets'));
const IncidentReview = lazy(() => import('./pages/admin/IncidentReview'));
const GuidelinesAdmin = lazy(() => import('./pages/admin/GuidelinesAdmin'));

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
