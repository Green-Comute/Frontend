const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="p-6 rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 bg-stone-50">
      <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-stone-900 mb-3">{title}</h3>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
