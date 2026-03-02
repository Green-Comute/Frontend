import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputField from './InputField';

describe('InputField Component', () => {
  it('should render label correctly', () => {
    render(
      <InputField 
        label="Email" 
        type="email" 
        name="email" 
        value="" 
        onChange={() => {}} 
      />
    );
    
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should show required asterisk when required is true', () => {
    render(
      <InputField 
        label="Password" 
        type="password" 
        name="password" 
        value="" 
        onChange={() => {}} 
        required={true}
      />
    );
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should not show asterisk when required is false', () => {
    render(
      <InputField 
        label="Optional Field" 
        type="text" 
        name="optional" 
        value="" 
        onChange={() => {}} 
      />
    );
    
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should render input with correct type', () => {
    render(
      <InputField 
        label="Email" 
        type="email" 
        name="email" 
        value="" 
        onChange={() => {}} 
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should display placeholder text', () => {
    render(
      <InputField 
        label="Username" 
        type="text" 
        name="username" 
        value="" 
        onChange={() => {}} 
        placeholder="Enter your username"
      />
    );
    
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
  });

  it('should call onChange handler when user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    
    render(
      <InputField 
        label="Name" 
        type="text" 
        name="name" 
        value="" 
        onChange={handleChange} 
      />
    );
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'John');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should display hint text when provided', () => {
    render(
      <InputField 
        label="Password" 
        type="password" 
        name="password" 
        value="" 
        onChange={() => {}} 
        hint="Must be at least 8 characters"
      />
    );
    
    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
  });

  it('should respect maxLength attribute', () => {
    render(
      <InputField 
        label="Phone" 
        type="tel" 
        name="phone" 
        value="" 
        onChange={() => {}} 
        maxLength={10}
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('should display the current value', () => {
    render(
      <InputField 
        label="Email" 
        type="email" 
        name="email" 
        value="test@example.com" 
        onChange={() => {}} 
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test@example.com');
  });

  it('should have correct styling classes', () => {
    render(
      <InputField 
        label="Test" 
        type="text" 
        name="test" 
        value="" 
        onChange={() => {}} 
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('w-full', 'px-4', 'py-3', 'border', 'rounded-lg');
  });
});
