const UserTypeSelector = ({ userType, setUserType }) => {
  const userTypes = [
    { value: 'employee', label: 'Employee' },
    { value: 'org-admin', label: 'Org Admin' },
    { value: 'platform-admin', label: 'Platform Admin' }
  ];

  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-stone-700 mb-3">
        I am a <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {userTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setUserType(type.value)}
            className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
              userType === type.value
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserTypeSelector;
