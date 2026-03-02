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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 text-stone-600 hover:text-emerald-700 font-medium"
        >
          ← Back to home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-stone-800">
              GreenCommute
            </span>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-stone-600 text-center mb-8">
            Sign in to continue your journey
          </p>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold text-lg shadow disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
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
            className="w-full py-3 flex items-center justify-center gap-2 border-2 border-stone-300 rounded-lg hover:border-emerald-500 hover:text-emerald-700 font-semibold text-stone-700 transition-colors disabled:opacity-50"
          >
            <Fingerprint className="w-5 h-5" />
            {passkeyLoading ? "Verifying..." : "Sign in with Passkey"}
          </button>
          <p className="text-center text-xs text-stone-400 mt-2">
            Touch ID · Face ID · Device PIN
          </p>

          <p className="text-center text-stone-600 mt-4">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Secure authentication with corporate email verification</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
