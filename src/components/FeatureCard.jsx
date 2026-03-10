const FeatureCard = ({ icon, title, description }) => {
  return (
    <article className="group p-6 rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 bg-white">
      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-5 group-hover:bg-emerald-100 group-hover:scale-105 transition-all duration-300" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-stone-900 mb-2 leading-snug">{title}</h3>
      <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
    </article>
  );
};

export default FeatureCard;
