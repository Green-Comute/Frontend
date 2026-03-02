import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    homeAddress: "",
    workAddress: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const res = await fetch(
        "http://localhost:5000/api/users/complete-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(form),
        }
      );
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.message || "Failed to complete profile");
        setLoading(false);
        return;
      }
  
      // ✅ IMPORTANT: stop loading before redirect
      setLoading(false);
  
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-stone-100 flex items-center justify-center px-6">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200 p-12">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-stone-900 mb-3">
              Complete Your Profile
            </h1>
            <p className="text-stone-600 text-lg">
              This information helps personalize your carpool experience.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Personal */}
            <section>
              <h2 className="text-xl font-semibold text-stone-800 mb-4">
                Personal Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  name="name"
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={handleChange}
                  className="input"
                  required
                />

                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  className="input"
                  required
                />

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="input md:col-span-2"
                  required
                >
                  <option value="">Select Gender *</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">
                    Prefer not to say
                  </option>
                </select>
              </div>
            </section>

            {/* Address */}
            <section>
              <h2 className="text-xl font-semibold text-stone-800 mb-4">
                Address Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  name="homeAddress"
                  placeholder="Home Address *"
                  value={form.homeAddress}
                  onChange={handleChange}
                  className="input"
                  required
                />

                <input
                  name="workAddress"
                  placeholder="Work Address *"
                  value={form.workAddress}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </section>

            {/* Emergency (optional) */}
            <section>
              <h2 className="text-xl font-semibold text-stone-800 mb-2">
                Emergency Contact
              </h2>
              <p className="text-sm text-stone-500 mb-4">
                Optional but recommended
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  name="emergencyContactName"
                  placeholder="Contact Name"
                  value={form.emergencyContactName}
                  onChange={handleChange}
                  className="input"
                />

                <input
                  name="emergencyContactPhone"
                  placeholder="Contact Phone"
                  value={form.emergencyContactPhone}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </section>

            <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {loading ? "Saving profile..." : "Save & Continue"}
            </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
