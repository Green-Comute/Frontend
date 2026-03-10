const StatCard = ({ value, label, icon }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-stone-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0" aria-hidden="true">
            {icon}
          </div>
        )}
        <div>
          <div className="metric-value text-2xl">{value}</div>
          <div className="metric-label">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
