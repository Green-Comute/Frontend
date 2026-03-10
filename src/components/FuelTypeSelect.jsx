import { FUEL_TYPES } from '../config/fuelTypes';

const FuelTypeSelect = ({ value, onChange, required = true, disabled = false }) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor="fuelType" className="block text-sm font-medium text-stone-700">
        Fuel Type {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>

      <select
        id="fuelType"
        name="fuelType"
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-label="Fuel Type"
        className="input-field appearance-none bg-white disabled:bg-stone-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          Select fuel type
        </option>

        {FUEL_TYPES.map(({ value: fuelValue, label }) => (
          <option key={fuelValue} value={fuelValue}>
            {label}
          </option>
        ))}
      </select>

      <p className="text-xs text-stone-500">
        Choose the fuel type that best describes your vehicle.
      </p>
    </div>
  );
};

export default FuelTypeSelect;
