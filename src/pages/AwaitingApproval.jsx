import { Leaf, Clock } from "lucide-react";

const AwaitingApproval = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-stone-200 p-8 text-center">
        
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-7 h-7 text-emerald-700" />
        </div>

        <h2 className="text-2xl font-bold text-stone-900 mb-2">
          Awaiting Approval
        </h2>

        <p className="text-stone-600 mb-6">
          Your account has been created successfully.
          <br />
          Please wait for your organization administrator to approve your access.
        </p>

        <div className="text-sm text-stone-500 bg-stone-50 border rounded-lg p-4">
          If this takes too long, please contact your organization admin.
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-emerald-700">
          <Leaf className="w-4 h-4" />
          <span className="text-sm font-medium">GreenCommute</span>
        </div>
      </div>
    </div>
  );
};

export default AwaitingApproval;
