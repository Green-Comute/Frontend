import { useNavigate } from "react-router-dom";
import { Car, Upload } from "lucide-react";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")); 
  // Make sure you store this on login

  const showDriverUpload =
    user?.profileCompleted && !user?.documentsUploaded;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-stone-900">
        Welcome to GreenCommute 🌱
      </h1>

      <p className="text-stone-600">
        Start sharing rides with colleagues from your organization.
      </p>

      {/* Driver CTA */}
      {showDriverUpload && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-800">
                Want to become a driver?
              </p>
              <p className="text-sm text-emerald-700">
                Upload your documents to get approved
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/driver/upload")}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Upload className="w-4 h-4" />
            Upload Docs
          </button>
        </div>
      )}

      {/* Feature cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Find Rides</h3>
          <p className="text-sm text-stone-600">
            Match with colleagues along your route.
          </p>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Offer a Ride</h3>
          <p className="text-sm text-stone-600">
            Share your commute and save emissions.
          </p>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Impact</h3>
          <p className="text-sm text-stone-600">
            Track CO₂ saved and rides shared.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
