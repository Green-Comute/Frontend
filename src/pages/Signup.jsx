import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Shield, Mail } from "lucide-react";
import InputField from "../components/InputField";
import { authService } from "../services/authService";
import { ASSETS_BASE_URL } from '../config/api.config';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Steps: "form" → "otp"
  const [step, setStep] = useState("form");
  const [otpSending, setOtpSending] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    orgCode: "",
    otp: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.orgCode.trim()) {
      setError("Organization code is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!validateForm()) return;

    setOtpSending(true);
    setError("");

    try {
      const res = await fetch(`${ASSETS_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          orgCode: formData.orgCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setOtpSending(false);
    }
  };

  // Step 2: Submit registration with OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === "form") {
      handleSendOtp();
      return;
    }

    if (!formData.otp.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    const result = await authService.signup({
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      orgCode: formData.orgCode,
      otp: formData.otp,
    });

    if (result.success) {
      // Check if auto-approved or pending
      if (result.data?.autoApproved) {
        navigate("/login");
      } else {
        navigate("/awaiting-approval");
      }
    } else {
      setError(result.error || "Signup failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md animate-fade-in">
        <button
          onClick={() => navigate("/")}
          className="mb-6 text-stone-600 hover:text-emerald-700 transition-colors font-medium"
        >
          ← Back to home
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-stone-800">
              GreenCommute
            </span>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 text-center mb-6">
            Create your account
          </h2>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2" role="alert">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === "form" && (
              <>
                <InputField
                  label="Organization Code"
                  type="text"
                  name="orgCode"
                  value={formData.orgCode}
                  onChange={handleChange}
                  placeholder="e.g. AMRITA2024"
                  required
                />

                <InputField
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <InputField
                  label="Corporate Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <InputField
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <InputField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="submit"
                  disabled={otpSending}
                  className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                >
                  {otpSending ? (
                    <><span className="spinner" /> Sending verification code...</>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Verify Email & Sign Up
                    </>
                  )}
                </button>
              </>
            )}

            {step === "otp" && (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
                  <p className="font-medium mb-1">📧 Verification code sent!</p>
                  <p>
                    Check your inbox at <strong>{formData.email}</strong> and
                    enter the 6-digit code below.
                  </p>
                </div>

                <InputField
                  label="Verification Code"
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter 6-digit code"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                >
                  {loading ? <><span className="spinner" /> Creating account...</> : "Complete Sign Up"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="btn-secondary w-full py-2 text-sm"
                >
                  ← Back to form
                </button>
              </>
            )}
          </form>

          <p className="text-center text-stone-600 mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Sign in
            </button>
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Secure corporate authentication</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
