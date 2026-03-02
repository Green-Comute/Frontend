import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DriverUpload = () => {
  const [license, setLicense] = useState(null);
  const [rc, setRc] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!license || !rc) {
      alert("Both License and RC are required");
      return;
    }

    const formData = new FormData();
    formData.append("license", license);
    formData.append("rc", rc);

    setLoading(true);

    const res = await fetch(
      "http://localhost:5000/driver/upload-documents",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      }
    );

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.message || "Upload failed");
      return;
    }

    alert("Documents uploaded successfully");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold">Upload Driver Documents</h2>

        <div>
          <label className="block text-sm font-medium mb-1">
            Driving License
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setLicense(e.target.files[0])}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Vehicle RC
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setRc(e.target.files[0])}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg"
        >
          {loading ? "Uploading..." : "Submit Documents"}
        </button>
      </form>
    </div>
  );
};

export default DriverUpload;
