import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CheckCircle, Car, Trash2, UserX, Eye, FileWarning } from "lucide-react";
import { registerPasskey } from "../../services/passkeyService";

const OrgAdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState("");
  const [passkeyStatus, setPasskeyStatus] = useState("");

  // Fetch pending users
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/org-admin/pending-users",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch users");
        }

        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  // Fetch all approved members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("http://localhost:5000/org-admin/members", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch members");

        setMembers(data.users);
      } catch (err) {
        console.error("Failed to fetch members:", err.message);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const approveUser = async (userId) => {
    try {
      const res = await fetch(
        "http://localhost:5000/org-admin/approve-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!res.ok) {
        throw new Error("Approval failed");
      }

      // Move from pending to members
      const approved = users.find((u) => u._id === userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      if (approved) {
        setMembers((prev) => [
          ...prev,
          { ...approved, approvalStatus: "APPROVED" },
        ]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const removeUser = async (userId, email) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${email} from your organization? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://localhost:5000/org-admin/remove-user/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Removal failed");

      setMembers((prev) => prev.filter((u) => u._id !== userId));
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

  if (loading) {
    return (
      <div className="page-container animate-fade-in">
        <div className="h-10 w-72 skeleton rounded mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="h-4 skeleton rounded w-3/4" />
              <div className="h-4 skeleton rounded w-1/2" />
              <div className="h-8 skeleton rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container animate-fade-in">
        <div className="empty-state">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-stone-900">
            Organization Admin Dashboard
          </h1>
        </div>
      <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/trips')}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Car className="w-4 h-4" /> View All Org Rides
          </button>
          <button
            onClick={() => navigate("/admin/driver-requests")}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Car className="w-4 h-4" />
            Driver Requests
          </button>
          <button
            onClick={() => navigate('/org-admin/esg')}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            ESG Dashboard
          </button>
          <button
            onClick={() => navigate('/admin/incidents')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium shadow-sm text-sm"
          >
            <FileWarning className="w-4 h-4" /> Incident Reports
          </button>
        </div>
      </div>

      {/* Pending Count */}
      <div className="mt-6 mb-4 text-sm text-stone-600">
        Pending approvals: {" "}
        <span className="badge-warning">{users.length}</span>
      </div>

      {/* Pending Users */}
      {
        users.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <p className="text-emerald-800 font-medium">
              🎉 No pending users at the moment
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto card">
            <table className="w-full border-collapse">
              <thead className="bg-stone-50">
                <tr className="border-b border-stone-200">
                  <th className="text-left p-4 text-sm font-medium text-stone-600">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-stone-600">Phone</th>
                  <th className="text-left p-4 text-sm font-medium text-stone-600">Joined</th>
                  <th className="text-left p-4 text-sm font-medium text-stone-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b hover:bg-stone-50">
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.phone}</td>
                    <td className="p-4">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => approveUser(u._id)}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      {/* ────── Manage Members ────── */}
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <UserX className="w-5 h-5 text-stone-700" />
          <h2 className="text-xl font-semibold text-stone-900">
            Organization Members
          </h2>
          <span className="ml-2 px-2 py-0.5 bg-stone-200 text-stone-700 text-xs font-medium rounded-full">
            {members.length}
          </span>
        </div>

        {membersLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 space-y-2">
                <div className="h-4 skeleton rounded w-3/4" />
                <div className="h-4 skeleton rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="bg-stone-100 border border-stone-200 p-6 rounded-xl">
            <p className="text-stone-600">No approved members yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto card">
            <table className="w-full border-collapse">
              <thead className="bg-stone-50">
                <tr className="border-b border-stone-200">
                  <th className="text-left p-4 text-sm font-medium text-stone-600">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-stone-600">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-stone-600">Phone</th>
                  <th className="text-left p-4 text-sm font-medium text-stone-600">Driver</th>
                  <th className="text-left p-4 text-sm font-medium text-stone-600">Joined</th>
                  <th className="text-left p-4 text-sm font-medium text-stone-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id} className="border-b hover:bg-stone-50">
                    <td className="p-4 text-sm">{m.email}</td>
                    <td className="p-4 text-sm">{m.name || "—"}</td>
                    <td className="p-4 text-sm">{m.phone}</td>
                    <td className="p-4">
                      <span
                        className={m.isDriver ? "badge-success" : "badge-neutral"}
                      >
                        {m.isDriver ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/user/${m._id}`)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => removeUser(m._id, m.email)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Security / Passkey */}
      <section className="mt-8 card p-6">
        <h2 className="section-title">Security</h2>
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
    </div >
  );
};

export default OrgAdminDashboard;
