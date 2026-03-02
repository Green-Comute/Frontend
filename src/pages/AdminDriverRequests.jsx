import { useEffect, useState } from "react";

const AdminDriverRequests = () => {
  const [drivers, setDrivers] = useState([]);
  const [reasons, setReasons] = useState({}); // 🔹 per-driver reason

  useEffect(() => {
    fetch("http://localhost:5000/org-admin/driver-requests", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setDrivers(data.drivers || []));
  }, []);

  const review = async (id, action) => {
    await fetch(
      `http://localhost:5000/org-admin/driver-requests/${id}/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body:
          action === "reject"
            ? JSON.stringify({ reason: reasons[id] || "" })
            : null,
      }
    );

    // Remove reviewed driver from UI
    setDrivers((prev) => prev.filter((d) => d._id !== id));

    // Cleanup reason
    setReasons((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Driver Requests</h1>

      {drivers.length === 0 && <p>No pending requests</p>}

      {drivers.map((d) => (
        <div
          key={d._id}
          className="bg-white border rounded-xl p-6 mb-4 shadow"
        >
          <p className="font-semibold text-lg">
            {d.name || d.email}
          </p>
          <p className="text-sm text-gray-500 mb-3">{d.phone}</p>

          {/* 📄 DOCUMENT LINKS */}
          <div className="flex gap-4 mb-4">
            {d.driverDocuments?.license && (
              <a
                href={`http://localhost:5000/${d.driverDocuments.license}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 underline"
              >
                View License
              </a>
            )}

            {d.driverDocuments?.rc && (
              <a
                href={`http://localhost:5000/${d.driverDocuments.rc}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 underline"
              >
                View RC
              </a>
            )}
          </div>

          {/* ❌ REJECTION REASON */}
          <textarea
            placeholder="Reason for rejection (optional)"
            value={reasons[d._id] || ""}
            onChange={(e) =>
              setReasons((prev) => ({
                ...prev,
                [d._id]: e.target.value,
              }))
            }
            className="w-full border rounded p-2 mb-4"
          />

          <div className="flex gap-3">
            <button
              onClick={() => review(d._id, "approve")}
              className="px-4 py-2 bg-emerald-600 text-white rounded"
            >
              Approve
            </button>

            <button
              onClick={() => review(d._id, "reject")}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDriverRequests;
