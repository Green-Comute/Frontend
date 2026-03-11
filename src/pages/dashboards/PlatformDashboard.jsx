import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, UserPlus, Shield, Globe, Car, FileWarning } from "lucide-react";
import { registerPasskey } from "../../services/passkeyService";
import { ASSETS_BASE_URL } from '../../config/api.config';

const PlatformDashboard = () => {
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState({
    name: "",
    orgCode: "",
    allowedDomains: "",
  });
  const [adminData, setAdminData] = useState({
    email: "",
    phone: "",
    password: "",
    orgCode: "",
  });
  const [organizations, setOrganizations] = useState([]);
  const [passkeyStatus, setPasskeyStatus] = useState("");

  // Fetch all organizations on mount
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch(`${ASSETS_BASE_URL}/platform/organizations`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await res.json();
        if (res.ok) setOrganizations(data.organizations || []);
      } catch (err) {
        console.error("Failed to fetch orgs:", err);
      }
    };
    fetchOrgs();
  }, []);

  const handleCreateOrg = async () => {
    try {
      const res = await fetch(`${ASSETS_BASE_URL}/platform/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(orgData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Organization created successfully");
      setOrganizations((prev) => [data, ...prev]);
      setOrgData({ name: "", orgCode: "", allowedDomains: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateOrgAdmin = async () => {
    try {
      const res = await fetch(`${ASSETS_BASE_URL}/platform/org-admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(adminData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Org Admin created successfully");
      setAdminData({ email: "", phone: "", password: "", orgCode: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegisterPasskey = async () => {
    setPasskeyStatus("loading");
    const result = await registerPasskey();
    setPasskeyStatus(result.success ? "success" : "error");
    setTimeout(() => setPasskeyStatus(""), 4000);
  };

  return (
    <div className="page-container animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <Shield className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Platform Admin Dashboard
            </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => navigate("/platform/esg")}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Globe className="w-4 h-4" />
          Global ESG Stats
        </button>
        <button
          onClick={() => navigate('/admin/trips')}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Car className="w-4 h-4" /> All Rides
        </button>
        <button
          onClick={() => navigate('/admin/incidents')}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium shadow-sm text-sm"
        >
          <FileWarning className="w-4 h-4" /> Incidents
        </button>
        </div>
      </div>

      {/* Create Organization */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-stone-900">Create Organization</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            className="input-field"
            placeholder="Organization Name"
            value={orgData.name}
            onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Org Code (e.g. AMRITA2024)"
            value={orgData.orgCode}
            onChange={(e) =>
              setOrgData({ ...orgData, orgCode: e.target.value })
            }
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Allowed Email Domains (comma-separated, optional)
          </label>
          <input
            className="input-field"
            placeholder="e.g. amrita.edu, tcs.com"
            value={orgData.allowedDomains}
            onChange={(e) =>
              setOrgData({ ...orgData, allowedDomains: e.target.value })
            }
          />
          <p className="text-xs text-stone-500 mt-1">
            If set, employees with matching email domains are auto-approved.
            Leave empty for manual Org Admin approval.
          </p>
        </div>

        <button
          onClick={handleCreateOrg}
          className="btn-primary mt-4"
        >
          Create Organization
        </button>
      </section>

      {/* Organizations List */}
      {organizations.length > 0 && (
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-stone-700" />
            <h2 className="text-lg font-semibold text-stone-900">
              Organizations ({organizations.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-stone-50">
                <tr className="border-b border-stone-200">
                  <th className="text-left p-3 text-sm font-medium text-stone-600">Name</th>
                  <th className="text-left p-3 text-sm font-medium text-stone-600">Code</th>
                  <th className="text-left p-3 text-sm font-medium text-stone-600">Allowed Domains</th>
                  <th className="text-left p-3 text-sm font-medium text-stone-600">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-stone-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org._id} className="border-b hover:bg-stone-50">
                    <td className="p-3 font-medium">{org.name}</td>
                    <td className="p-3">
                      <code className="bg-stone-100 px-2 py-1 rounded text-sm">
                        {org.orgCode}
                      </code>
                    </td>
                    <td className="p-3 text-sm">
                      {org.allowedDomains?.length > 0
                        ? org.allowedDomains.join(", ")
                        : "Any (manual approval)"}
                    </td>
                    <td className="p-3">
                      <span
                        className={org.isActive ? "badge-success" : "badge-danger"}
                      >
                        {org.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-stone-600">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Create Org Admin */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-stone-900">Create Org Admin</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            className="input-field"
            placeholder="Admin Email"
            value={adminData.email}
            onChange={(e) =>
              setAdminData({ ...adminData, email: e.target.value })
            }
          />
          <input
            className="input-field"
            placeholder="Phone"
            value={adminData.phone}
            onChange={(e) =>
              setAdminData({ ...adminData, phone: e.target.value })
            }
          />
          <input
            className="input-field"
            placeholder="Temporary Password"
            type="password"
            value={adminData.password}
            onChange={(e) =>
              setAdminData({ ...adminData, password: e.target.value })
            }
          />
          <select
            className="input-field bg-white"
            value={adminData.orgCode}
            onChange={(e) =>
              setAdminData({ ...adminData, orgCode: e.target.value })
            }
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org._id} value={org.orgCode}>
                {org.name} ({org.orgCode})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCreateOrgAdmin}
          className="btn-secondary mt-4"
        >
          Create Org Admin
        </button>
      </section>

      {/* Security / Passkey */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-stone-900">Security</h2>
        </div>
        <p className="text-sm text-stone-600 mb-4">
          Register a passkey (Touch ID / Face ID) to sign in without a password.
        </p>
        <button
          onClick={handleRegisterPasskey}
          disabled={passkeyStatus === "loading"}
          className="btn-primary flex items-center gap-2"
        >
          {passkeyStatus === "loading"
            ? <><span className="spinner" /> Registering...</>
            : "Register a Passkey"}
        </button>
        {passkeyStatus === "success" && (
          <p className="mt-2 text-sm text-emerald-600">
            ✅ Passkey registered!
          </p>
        )}
        {passkeyStatus === "error" && (
          <p className="mt-2 text-sm text-red-600">
            ❌ Registration failed. Try again.
          </p>
        )}
      </section>
    </div>
  );
};

export default PlatformDashboard;
