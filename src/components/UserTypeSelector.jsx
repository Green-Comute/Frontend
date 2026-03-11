const UserTypeSelector = ({ userType, setUserType }) => {
  const userTypes = [
    { value: 'employee', label: 'Employee' },
    { value: 'org-admin', label: 'Org Admin' },
    { value: 'platform-admin', label: 'Platform Admin' }
  ];

  return (
    <fieldset className="mb-2">
      <legend className="block text-sm font-medium text-stone-700 mb-2">
        I am a <span className="text-red-500" aria-hidden="true">*</span>
      </legend>
      <div className="grid grid-cols-3 gap-2" role="radiogroup">
        {userTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setUserType(type.value)}
            role="radio"
            aria-checked={userType === type.value}
            className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
              userType === type.value
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' 
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
};

export default UserTypeSelector;
