const InputField = ({ label, type, name, value, onChange, placeholder, required, hint, maxLength, error: fieldError, disabled }) => {
  const id = `field-${name}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = fieldError ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        disabled={disabled}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        aria-invalid={fieldError ? "true" : undefined}
        className={`input-field ${
          fieldError
            ? "border-red-400 focus:ring-red-500"
            : ""
        } ${disabled ? "bg-stone-50 text-stone-400 cursor-not-allowed" : ""}`}
      />
      {hint && !fieldError && (
        <p id={hintId} className="text-xs text-stone-500">{hint}</p>
      )}
      {fieldError && (
        <p id={errorId} className="text-xs text-red-600 flex items-center gap-1" role="alert">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {fieldError}
        </p>
      )}
    </div>
  );
};

export default InputField;
