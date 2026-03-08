import { FUEL_TYPES } from '../config/fuelTypes';

/**
 * FuelTypeSelect
 *
 * A controlled dropdown component for selecting a vehicle fuel type.
 * Renders exactly 6 options sourced from the central fuelTypes config.
 *
 * @param {Object}   props
 * @param {string}   props.value      - Currently selected fuel type value (controlled)
 * @param {Function} props.onChange   - Change handler receiving the native event
 * @param {boolean}  [props.required] - Whether the field is required
 * @param {boolean}  [props.disabled] - Whether the dropdown is disabled
 */
const FuelTypeSelect = ({ value, onChange, required = true, disabled = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Fuel Type {required && <span className="text-red-500" aria-label="required">*</span>}
      </label>

      <select
        name="fuelType"
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-label="Fuel Type"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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

      <p className="text-xs text-gray-500 mt-1">
        Choose the fuel type that best describes your vehicle.
      </p>
    </div>
  );
};

export default FuelTypeSelect;
