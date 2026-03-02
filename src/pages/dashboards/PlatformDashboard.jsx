import { useState, useEffect } from "react";
import { Building2, UserPlus, Shield, Globe } from "lucide-react";
import { registerPasskey } from "../../services/passkeyService";

const PlatformDashboard = () => {
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
        const res = await fetch("http://localhost:5000/platform/organizations", {
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
      const res = await fetch("http://localhost:5000/platform/organizations", {
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
      const res = await fetch("http://localhost:5000/platform/org-admins", {
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
    <div className="min-h-screen bg-stone-50 p-8 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-stone-900">
          Platform Admin Dashboard
        </h1>
      </div>

      {/* Create Organization */}
      <section className="bg-white border rounded-xl p-6 shadow">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Create Organization</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Organization Name"
            value={orgData.name}
            onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
          />
          <input
            className="border rounded-lg px-4 py-2"
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
            className="w-full border rounded-lg px-4 py-2"
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
          className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Create Organization
        </button>
      </section>

      {/* Organizations List */}
      {organizations.length > 0 && (
        <section className="bg-white border rounded-xl p-6 shadow">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-stone-700" />
            <h2 className="text-xl font-semibold">
              Organizations ({organizations.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-stone-100">
                <tr className="border-b">
                  <th className="text-left p-3 text-sm">Name</th>
                  <th className="text-left p-3 text-sm">Code</th>
                  <th className="text-left p-3 text-sm">Allowed Domains</th>
                  <th className="text-left p-3 text-sm">Status</th>
                  <th className="text-left p-3 text-sm">Created</th>
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
                        className={`text-xs px-2 py-1 rounded ${org.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                          }`}
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
      <section className="bg-white border rounded-xl p-6 shadow">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Create Org Admin</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Admin Email"
            value={adminData.email}
            onChange={(e) =>
              setAdminData({ ...adminData, email: e.target.value })
            }
          />
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Phone"
            value={adminData.phone}
            onChange={(e) =>
              setAdminData({ ...adminData, phone: e.target.value })
            }
          />
          <input
            className="border rounded-lg px-4 py-2"
            placeholder="Temporary Password"
            type="password"
            value={adminData.password}
            onChange={(e) =>
              setAdminData({ ...adminData, password: e.target.value })
            }
          />
          <select
            className="border rounded-lg px-4 py-2 bg-white"
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
          className="mt-4 px-5 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800"
        >
          Create Org Admin
        </button>
      </section>

      {/* Security / Passkey */}
      <section className="bg-white border rounded-xl p-6 shadow">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Security</h2>
        </div>
        <p className="text-sm text-stone-600 mb-4">
          Register a passkey (Touch ID / Face ID) to sign in without a password.
        </p>
        <button
          onClick={handleRegisterPasskey}
          disabled={passkeyStatus === "loading"}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {passkeyStatus === "loading"
            ? "Registering..."
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
