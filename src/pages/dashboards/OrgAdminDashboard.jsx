import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CheckCircle, Car, Trash2, UserX } from "lucide-react";
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
    return <p className="p-8">Loading pending users...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-stone-900">
            Organization Admin
          </h1>
        </div>

        {/* Driver Requests CTA */}
        <button
          onClick={() => navigate("/admin/driver-requests")}
          className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition"
        >
          <Car className="w-4 h-4" />
          Driver Requests
        </button>
      </div>

      {/* Pending Count */}
      <div className="mb-6 text-sm text-stone-600">
        Pending approvals:{" "}
        <span className="font-semibold text-emerald-700">{users.length}</span>
      </div>

      {/* Pending Users */}
      {users.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
          <p className="text-emerald-800 font-medium">
            🎉 No pending users at the moment
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border">
          <table className="w-full border-collapse">
            <thead className="bg-stone-100">
              <tr className="border-b">
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4">Action</th>
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
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          <p className="text-stone-600">Loading members...</p>
        ) : members.length === 0 ? (
          <div className="bg-stone-100 border border-stone-200 p-6 rounded-xl">
            <p className="text-stone-600">No approved members yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow border">
            <table className="w-full border-collapse">
              <thead className="bg-stone-100">
                <tr className="border-b">
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Phone</th>
                  <th className="text-left p-4">Driver</th>
                  <th className="text-left p-4">Joined</th>
                  <th className="text-left p-4">Action</th>
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
                        className={`text-xs px-2 py-1 rounded ${m.isDriver
                            ? "bg-green-100 text-green-700"
                            : "bg-stone-100 text-stone-500"
                          }`}
                      >
                        {m.isDriver ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => removeUser(m._id, m.email)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 🔑 Security / Passkey */}
      <section className="mt-8 bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">🔑 Security</h2>
        <p className="text-sm text-stone-600 mb-4">
          Register a passkey (Touch ID / Face ID) to sign in without a password.
        </p>
        <button
          onClick={handleRegisterPasskey}
          disabled={passkeyStatus === "loading"}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
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

export default OrgAdminDashboard;
