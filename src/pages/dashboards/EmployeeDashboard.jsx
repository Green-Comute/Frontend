import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rideService } from "../../services/rideService";
import { io } from 'socket.io-client';
import { registerPasskey } from "../../services/passkeyService";
import { API_BASE_URL, SOCKET_URL } from '../../config/api.config';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passengerRides, setPassengerRides] = useState([]);
  const [ridesLoading, setRidesLoading] = useState(true);
  const [passkeyStatus, setPasskeyStatus] = useState(""); // feedback for passkey UI
  const [tripNotification, setTripNotification] = useState("");

  // 🔹 Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Fetch passenger rides
  useEffect(() => {
    const fetchPassengerRides = async () => {
      try {
        setRidesLoading(true);
        const data = await rideService.getPassengerRides();
        setPassengerRides(data.rides || []);
      } catch (err) {
        console.error("Error fetching passenger rides:", err);
      } finally {
        setRidesLoading(false);
      }
    };

    if (user) {
      fetchPassengerRides();
    }
  }, [user]);

  // Setup socket for real-time ride status notifications
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('authToken');
    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to socket for ride notifications');
    });

    // Listen for ride approval/rejection
    socket.on('ride-approved-notification', (data) => {
      console.log('Ride approved:', data);
      // Refresh passenger rides
      rideService.getPassengerRides()
        .then(result => setPassengerRides(result.rides || []))
        .catch(err => console.error('Failed to refresh rides:', err));
    });

    socket.on('ride-rejected-notification', (data) => {
      console.log('Ride rejected:', data);
      // Refresh passenger rides
      rideService.getPassengerRides()
        .then(result => setPassengerRides(result.rides || []))
        .catch(err => console.error('Failed to refresh rides:', err));
    });

    socket.on('trip-cancelled', (data) => {
      console.log('Trip cancelled log:', data);
      setTripNotification(data.message || 'A trip you were on has been cancelled.');
      setTimeout(() => setTripNotification(""), 6000);
      rideService.getPassengerRides()
        .then(result => setPassengerRides(result.rides || []))
        .catch(err => console.error('Failed to refresh rides:', err));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // 🔹 Request driver access
  const requestDriver = async () => {
    setActionLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/users/driver-intent`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser((prev) => ({
        ...prev,
        isDriver: true,
        driverStatus: "PENDING",
      }));

      setMessage("Driver request submitted. Upload documents next.");

      setTimeout(() => {
        navigate("/driver/upload");
      }, 1200);
    } catch (err) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  // 🔑 Register a new passkey
  const handleRegisterPasskey = async () => {
    setPasskeyStatus("loading");
    const result = await registerPasskey();
    setPasskeyStatus(result.success ? "success" : "error");
    setTimeout(() => setPasskeyStatus(""), 4000);
  };

  if (loading) {
    return (
      <div className="page-container animate-fade-in">
        <div className="skeleton h-8 w-64 mb-3"></div>
        <div className="skeleton h-4 w-96 mb-8"></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 space-y-3">
              <div className="skeleton h-5 w-36"></div>
              <div className="skeleton h-3 w-48"></div>
              <div className="skeleton h-3 w-40"></div>
              <div className="skeleton h-9 w-full mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Safety guard
  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <p className="text-stone-600 font-medium">Failed to load user data</p>
          <p className="text-sm text-stone-500 mt-1">Please try refreshing the page</p>
        </div>
      </div>  
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {tripNotification && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3" role="alert">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          </div>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Trip Update</p>
            <p className="text-amber-700 text-sm mt-0.5">{tripNotification}</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="section-title text-2xl sm:text-3xl">
          Welcome to GreenCommute
        </h1>
        <p className="section-subtitle text-sm sm:text-base">
          Start sharing rides with colleagues from your organization.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Personal Details */}
        <div className="card p-5">
          <h3 className="font-semibold text-base mb-4 text-stone-900">
            Personal Details
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Name</span>
              <span className="font-medium text-stone-900">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Email</span>
              <span className="font-medium text-stone-900 text-xs">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Role</span>
              <span className="font-medium capitalize text-stone-900">{user.role}</span>
            </div>
            {user.phone && (
              <div className="flex justify-between">
                <span className="text-stone-500">Phone</span>
                <span className="font-medium">{user.phone}</span>
              </div>
            )}
            {user.organizationId && (
              <div className="flex justify-between">
                <span className="text-stone-500">Organization</span>
                <span className="font-medium text-xs">{user.organizationId}</span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-100">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Profile</span>
                <span className={`text-xs px-2 py-1 rounded ${user.profileCompleted
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
                  }`}>
                  {user.profileCompleted ? "Complete" : "Incomplete"}
                </span>
              </div>
            </div>
            {!user.profileCompleted && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-amber-600 mb-2">Required to complete:</p>
                <ul className="text-xs text-stone-600 space-y-1 ml-4 list-disc">
                  {!user.name && <li>Name</li>}
                  {!user.dob && <li>Date of Birth</li>}
                  {!user.gender && <li>Gender</li>}
                  {!user.homeAddress && <li>Home Address</li>}
                  {!user.workAddress && <li>Work Address</li>}
                </ul>
                <button
                  onClick={() => navigate("/complete-profile")}
                  className="btn-primary w-full text-sm py-2 mt-3"
                >
                  Complete Profile
                </button>
              </div>
            )}
            {user.isDriver && (
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Driver Status</span>
                <span className={`text-xs px-2 py-1 rounded ${user.driverStatus === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : user.driverStatus === "PENDING"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-700"
                  }`}>
                  {user.driverStatus || "N/A"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Find Rides */}
        <div className="card p-5">
          <h3 className="font-semibold text-base mb-2 text-stone-900">Find Rides</h3>
          <p className="text-sm text-stone-500 mb-4">
            Search and book rides with colleagues along your route.
          </p>
          <button
            onClick={() => navigate("/passenger/search")}
            className="btn-primary w-full text-sm"
          >
            Search Available Trips
          </button>
        </div>

        {/* Offer Ride */}
        <div className="card p-5">
          <h3 className="font-semibold text-base mb-2 text-stone-900">Offer a Ride</h3>
          <p className="text-sm text-stone-500 mb-4">
            Create trips and share your commute to save emissions.
          </p>
          {user.driverStatus === "APPROVED" ? (
            <div className="space-y-2">
              <button
                onClick={() => navigate("/driver/create-trip")}
                className="btn-primary w-full text-sm"
              >
                Create New Trip
              </button>
              <button
                onClick={() => navigate("/driver/requests")}
                className="btn-secondary w-full text-sm"
              >
                Manage Requests
              </button>
            </div>
          ) : (
            <p className="text-sm text-amber-600">
              {user.driverStatus === "PENDING"
                ? "⏳ Driver approval pending"
                : "Become an approved driver to offer rides"}
            </p>
          )}
        </div>

        {/* Green Impact */}
        <div className="card p-5 border-emerald-200">
          <h3 className="font-semibold text-base mb-2 text-stone-900">My Green Impact</h3>
          <p className="text-sm text-stone-500 mb-4">
            Track your CO₂ savings, trees equivalent, and sustainability stats.
          </p>
          <button
            onClick={() => navigate("/impact/my")}
            className="btn-primary w-full text-sm"
          >
            View My Impact
          </button>
        </div>

        {/* Driver Card */}
        <div className="card p-5">
          <h3 className="font-semibold text-base mb-2 text-stone-900">Become a Driver</h3>

          {/* NOT A DRIVER */}
          {!user.isDriver && (
            <>
              <p className="text-sm text-stone-600 mb-4">
                Offer rides to colleagues and reduce emissions.
              </p>
              <button
                onClick={requestDriver}
                disabled={actionLoading}
                className="btn-primary text-sm"
              >
                {actionLoading ? "Submitting..." : "Request Driver Access"}
              </button>
            </>
          )}

          {/* DRIVER BUT NO DOCS */}
          {user.isDriver && !user.documentsUploaded && (
            <>
              <p className="text-sm text-stone-600 mb-4">
                Upload license & RC to continue
              </p>
              <button
                onClick={() => navigate("/driver/upload")}
                className="btn-primary text-sm"
              >
                Upload Driver Documents
              </button>
            </>
          )}

          {/* DOCS UPLOADED, PENDING */}
          {user.driverStatus === "PENDING" && user.documentsUploaded && (
            <p className="text-emerald-700 font-medium mt-3">
              Driver request submitted. Awaiting approval.
            </p>
          )}

          {/* APPROVED */}
          {user.driverStatus === "APPROVED" && (
            <p className="text-emerald-700 font-semibold mt-3">
              ✅ You are an approved driver
            </p>
          )}

          {/* REJECTED */}
          {user.driverStatus === "REJECTED" && (
            <p className="text-red-600 mt-3">
              ❌ Rejected: {user.driverRejectionReason || "No reason provided"}
            </p>
          )}

          {message && (
            <p className="mt-3 text-sm text-emerald-700">{message}</p>
          )}
        </div>

        {/* Security / Passkey */}
        <div className="card p-5">
          <h3 className="font-semibold text-base mb-2 text-stone-900">Security</h3>
          <p className="text-sm text-stone-500 mb-4">
            Register a passkey (Touch ID / Face ID) so you can sign in without a password next time.
          </p>
          <button
            onClick={handleRegisterPasskey}
            disabled={passkeyStatus === "loading"}
            className="btn-primary text-sm"
          >
            {passkeyStatus === "loading" ? "Registering..." : "Register a Passkey"}
          </button>
          {passkeyStatus === "success" && (
            <p className="mt-2 text-sm text-emerald-600">✅ Passkey registered! Use it next time you log in.</p>
          )}
          {passkeyStatus === "error" && (
            <p className="mt-2 text-sm text-red-600">❌ Registration failed. Try again.</p>
          )}
        </div>
      </div>

      {/* My Rides Section */}
      <section className="mt-10">
        <h2 className="section-title text-xl sm:text-2xl">
          My Rides as Passenger
        </h2>
        <p className="section-subtitle text-sm">Your ride requests and status</p>

        {ridesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="flex justify-between">
                  <div className="skeleton h-5 w-20"></div>
                  <div className="skeleton h-4 w-16"></div>
                </div>
                <div className="skeleton h-3 w-full"></div>
                <div className="skeleton h-3 w-3/4"></div>
                <div className="skeleton h-9 w-full mt-2"></div>
              </div>
            ))}
          </div>
        ) : passengerRides.length === 0 ? (
          <div className="card p-8">
            <div className="empty-state">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <p className="text-stone-600 font-medium">No rides yet</p>
              <p className="text-sm text-stone-500 mt-1 mb-4">Search for trips from colleagues heading your way</p>
              <button
                onClick={() => navigate("/passenger/search")}
                className="btn-primary text-sm"
              >
                Find Your First Ride
              </button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {passengerRides.map((ride) => (
              <article
                key={ride._id}
                className="card p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`badge ${ride.status === "APPROVED"
                    ? "badge-success"
                    : ride.status === "REJECTED"
                      ? "badge-danger"
                      : "badge-warning"
                    }`}>
                    {ride.status}
                  </span>
                  <span className="text-xs text-stone-500">
                    {new Date(ride.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-stone-600">From:</span>
                    <p className="font-medium text-stone-900">
                      {ride.tripId?.source || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-600">To:</span>
                    <p className="font-medium text-stone-900">
                      {ride.tripId?.destination || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-600">Driver:</span>
                    <p className="font-medium text-stone-900">
                      {ride.tripId?.driverId?.name || "Unknown Driver"}
                    </p>
                  </div>
                  {ride.tripId?.departureTime && (
                    <div>
                      <span className="text-stone-600">Departure:</span>
                      <p className="font-medium text-stone-900">
                        {new Date(ride.tripId.departureTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {ride.tripId?.seatsAvailable !== undefined && (
                    <div>
                      <span className="text-stone-600">Seats Available:</span>
                      <span className="font-medium text-stone-900 ml-2">
                        {ride.tripId.seatsAvailable}
                      </span>
                    </div>
                  )}
                </div>

                {/* Track Trip Button for approved and active rides */}
                {ride.status === 'APPROVED' && ride.tripId?.status && ['STARTED', 'SCHEDULED'].includes(ride.tripId.status) && (
                  <div className="mt-3">
                    <button
                      onClick={() => navigate(`/passenger/ride/${ride._id}`)}
                      className="btn-primary w-full text-sm py-2"
                    >
                      {ride.tripId.status === 'STARTED' ? 'Track Live' : 'View Details'}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployeeDashboard;
