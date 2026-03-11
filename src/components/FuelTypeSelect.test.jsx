import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FuelTypeSelect from './FuelTypeSelect';
import { FUEL_TYPES, FUEL_TYPE_VALUES } from '../config/fuelTypes';

// ─── Helper ───────────────────────────────────────────────────────────────────

const renderSelect = (props = {}) => {
  const defaults = {
    value: '',
    onChange: vi.fn(),
    required: true,
    disabled: false,
  };
  return render(<FuelTypeSelect {...defaults} {...props} />);
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FuelTypeSelect Component', () => {

  // ── Rendering ────────────────────────────────────────────────────────────

  describe('Rendering', () => {

    it('should render the label "Fuel Type"', () => {
      renderSelect();
      // Use getAllByText to handle multiple matches; at least one must be the visible label
      const matches = screen.getAllByText(/fuel type/i);
      const labelEl = matches.find(el => el.tagName.toLowerCase() === 'label');
      expect(labelEl).toBeInTheDocument();
    });

    it('should render the required asterisk when required=true', () => {
      const { container } = renderSelect({ required: true });
      const asterisk = container.querySelector('span.text-red-500');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveTextContent('*');
    });

    it('should NOT render the required asterisk when required=false', () => {
      const { container } = renderSelect({ required: false });
      const asterisk = container.querySelector('span.text-red-500');
      expect(asterisk).not.toBeInTheDocument();
    });

    it('should render the select element with aria-label "Fuel Type"', () => {
      renderSelect();
      expect(screen.getByRole('combobox', { name: /fuel type/i })).toBeInTheDocument();
    });

    it('should render a placeholder "Select fuel type" option', () => {
      renderSelect();
      expect(screen.getByText('Select fuel type')).toBeInTheDocument();
    });

    it('should render exactly 6 fuel type options (excluding placeholder)', () => {
      renderSelect();
      const select = screen.getByRole('combobox', { name: /fuel type/i });
      // All options = 6 fuel types + 1 placeholder
      expect(select.options.length).toBe(7);

      // Count non-placeholder options
      const fuelOptions = Array.from(select.options).filter(opt => opt.value !== '');
      expect(fuelOptions).toHaveLength(6);
    });

    it('should render all 6 required fuel types', () => {
      renderSelect();
      expect(FUEL_TYPES).toHaveLength(6); // config-level guard

      FUEL_TYPES.forEach(({ label }) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('should render a helper hint text', () => {
      renderSelect();
      expect(screen.getByText(/choose the fuel type/i)).toBeInTheDocument();
    });
  });

  // ── Controlled value / selection ─────────────────────────────────────────

  describe('Controlled value', () => {

    it('should display no selection when value is empty string', () => {
      renderSelect({ value: '' });
      const select = screen.getByRole('combobox', { name: /fuel type/i });
      expect(select.value).toBe('');
    });

    it('should display PETROL when value is "PETROL"', () => {
      renderSelect({ value: 'PETROL' });
      const select = screen.getByRole('combobox', { name: /fuel type/i });
      expect(select.value).toBe('PETROL');
    });

    it('should persist the selected value for each valid fuel type', () => {
      FUEL_TYPE_VALUES.forEach(fuelValue => {
        const { unmount } = render(
          <FuelTypeSelect value={fuelValue} onChange={vi.fn()} />
        );
        const select = screen.getByRole('combobox', { name: /fuel type/i });
        expect(select.value).toBe(fuelValue);
        unmount();
      });
    });
  });

  // ── onChange interaction ──────────────────────────────────────────────────

  describe('onChange interaction', () => {

    it('should call onChange handler when a fuel type is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      renderSelect({ value: '', onChange });

      const select = screen.getByRole('combobox', { name: /fuel type/i });
      await user.selectOptions(select, 'DIESEL');

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should pass native event when onChange is triggered', () => {
      const onChange = vi.fn();
      renderSelect({ value: '', onChange });

      const select = screen.getByRole('combobox', { name: /fuel type/i });
      fireEvent.change(select, { target: { value: 'ELECTRIC' } });

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'change' }));
    });
  });

  // ── Disabled state ────────────────────────────────────────────────────────

  describe('Disabled state', () => {

    it('should disable the select element when disabled=true', () => {
      renderSelect({ disabled: true });
      const select = screen.getByRole('combobox', { name: /fuel type/i });
      expect(select).toBeDisabled();
    });

    it('should enable the select element when disabled=false', () => {
      renderSelect({ disabled: false });
      const select = screen.getByRole('combobox', { name: /fuel type/i });
      expect(select).not.toBeDisabled();
    });
  });

  // ── Invalid value guard ───────────────────────────────────────────────────

  describe('Invalid value guard', () => {

    it('should not have an option for an invalid fuel type like HYDROGEN', () => {
      renderSelect();
      const select = screen.getByRole('combobox', { name: /fuel type/i });
      const values = Array.from(select.options).map(o => o.value);
      expect(values).not.toContain('HYDROGEN');
    });

    it('should not have an option for lowercase "petrol"', () => {
      renderSelect();
      const select = screen.getByRole('combobox', { name: /fuel type/i });
      const values = Array.from(select.options).map(o => o.value);
      expect(values).not.toContain('petrol');
    });
  });

  // ── Config contract ───────────────────────────────────────────────────────

  describe('Config contract', () => {

    it('FUEL_TYPES config array should have exactly 6 entries', () => {
      expect(FUEL_TYPES).toHaveLength(6);
    });

    it('FUEL_TYPE_VALUES should contain all required values', () => {
      expect(FUEL_TYPE_VALUES).toContain('PETROL');
      expect(FUEL_TYPE_VALUES).toContain('DIESEL');
      expect(FUEL_TYPE_VALUES).toContain('ELECTRIC');
      expect(FUEL_TYPE_VALUES).toContain('HYBRID');
      expect(FUEL_TYPE_VALUES).toContain('CNG');
      expect(FUEL_TYPE_VALUES).toContain('LPG');
    });
  });
});
