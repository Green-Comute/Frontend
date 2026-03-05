import { useNavigate } from "react-router-dom";
import { Car, Upload, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { gamificationService } from "../services/gamificationService";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  // Make sure you store this on login

  const showDriverUpload =
    user?.profileCompleted && !user?.documentsUploaded;

  const [points, setPoints] = useState({ pointsBalance: 0, currentTier: 'BRONZE' });

  useEffect(() => {
    gamificationService.getBalance()
      .then(res => setPoints(res.data))
      .catch(err => console.error("Failed to load points:", err));
  }, []);

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

        {/* Epic-4: Gamification Points Widget */}
        <div className="p-6 bg-white border border-emerald-100 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award className="w-16 h-16 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-emerald-800">
            <Award className="w-5 h-5" />
            My Points
          </h3>
          <div className="mt-4 mb-2">
            <span className="text-4xl font-bold text-emerald-600">{points.pointsBalance.toLocaleString()}</span>
            <span className="text-stone-500 ml-2">pts</span>
          </div>
          <p className="text-sm font-medium text-stone-600 mb-4 bg-stone-100 px-3 py-1 inline-block rounded-full">
            Tier: {points.currentTier}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/rewards')}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              Redeem
            </button>
            <button
              onClick={() => navigate('/gamification/history')}
              className="flex-1 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition"
            >
              History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
