const InputField = ({ label, type, name, value, onChange, placeholder, required, hint, maxLength }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
      />
      {hint && <p className="text-xs text-stone-500 mt-1">{hint}</p>}
    </div>
  );
};

export default InputField;
