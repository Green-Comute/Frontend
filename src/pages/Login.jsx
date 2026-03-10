import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Shield, Fingerprint } from "lucide-react";
import InputField from "../components/InputField";
import { authService } from "../services/authService";
import { loginWithPasskey } from "../services/passkeyService";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await authService.login(
      formData.email,
      formData.password
    );

    setLoading(false);

    if (!result.success) {
      // Awaiting approval flow
      if (result.approvalStatus === "PENDING") {
        navigate("/awaiting-approval");
        return;
      }

      setError(result.error || "Login failed. Please try again.");
      return;
    }

    const { user } = result.data;

    // First-time login → complete profile
    if (!user.profileCompleted) {
      navigate("/complete-profile");
      return;
    }

    // Normal login
    navigate("/dashboard");
  };

  const handlePasskeyLogin = async () => {
    if (!formData.email) {
      setError("Enter your email first, then click Sign in with Passkey.");
      return;
    }
    setPasskeyLoading(true);
    setError("");

    const result = await loginWithPasskey(formData.email);
    setPasskeyLoading(false);

    if (!result.success) {
      setError(result.message || "Passkey login failed.");
      return;
    }

    const { user } = result.data;
    if (!user.profileCompleted) {
      navigate("/complete-profile");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-sm text-stone-600 hover:text-emerald-700 font-medium transition-colors"
        >
          ← Back to home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6 sm:p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-800">
              GreenCommute
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 text-center mb-1">
            Welcome Back
          </h2>
          <p className="text-sm text-stone-500 text-center mb-6">
            Sign in to continue your journey
          </p>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2" role="alert">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@company.com"
              required
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner w-4 h-4 border-2 border-white/30 border-t-white"></span>
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5 gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400 uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Passkey Login */}
          <button
            type="button"
            onClick={handlePasskeyLogin}
            disabled={passkeyLoading}
            className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-5 h-5" />
            {passkeyLoading ? "Verifying..." : "Sign in with Passkey"}
          </button>
          <p className="text-center text-xs text-stone-400 mt-2">
            Touch ID · Face ID · Device PIN
          </p>

          <p className="text-center text-sm text-stone-600 mt-5">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="mt-5 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Secure authentication with corporate email verification</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
