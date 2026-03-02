const StatCard = ({ value, label }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-200">
      <div className="text-3xl font-bold text-emerald-700 mb-1">{value}</div>
      <div className="text-sm text-stone-600">{label}</div>
    </div>
  );
};

export default StatCard;
