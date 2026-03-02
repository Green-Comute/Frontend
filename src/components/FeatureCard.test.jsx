import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeatureCard from './FeatureCard';

describe('FeatureCard Component', () => {
  const mockIcon = <svg data-testid="test-icon">Icon</svg>;

  it('should render title correctly', () => {
    render(
      <FeatureCard 
        icon={mockIcon}
        title="Eco-Friendly Travel"
        description="Reduce your carbon footprint"
      />
    );
    
    expect(screen.getByText('Eco-Friendly Travel')).toBeInTheDocument();
  });

  it('should render description correctly', () => {
    render(
      <FeatureCard 
        icon={mockIcon}
        title="Feature Title"
        description="This is a detailed description of the feature"
      />
    );
    
    expect(screen.getByText('This is a detailed description of the feature')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(
      <FeatureCard 
        icon={mockIcon}
        title="Feature"
        description="Description"
      />
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should have correct container styling', () => {
    const { container } = render(
      <FeatureCard 
        icon={mockIcon}
        title="Feature"
        description="Description"
      />
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('p-6', 'rounded-xl', 'border', 'border-stone-200');
  });

  it('should have hover effect classes', () => {
    const { container } = render(
      <FeatureCard 
        icon={mockIcon}
        title="Feature"
        description="Description"
      />
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('hover:border-emerald-300', 'hover:shadow-lg', 'transition-all');
  });

  it('should render icon in styled container', () => {
    const { container } = render(
      <FeatureCard 
        icon={mockIcon}
        title="Feature"
        description="Description"
      />
    );
    
    const iconContainer = container.querySelector('.w-14.h-14');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('bg-emerald-100', 'rounded-lg', 'flex', 'items-center');
  });

  it('should render title with correct styling', () => {
    render(
      <FeatureCard 
        icon={mockIcon}
        title="Test Title"
        description="Test Description"
      />
    );
    
    const title = screen.getByText('Test Title');
    expect(title).toHaveClass('text-xl', 'font-semibold', 'text-stone-900', 'mb-3');
  });

  it('should render description with correct styling', () => {
    render(
      <FeatureCard 
        icon={mockIcon}
        title="Title"
        description="Test description text"
      />
    );
    
    const description = screen.getByText('Test description text');
    expect(description).toHaveClass('text-stone-600', 'leading-relaxed');
  });

  it('should render multiple feature cards independently', () => {
    const { rerender } = render(
      <FeatureCard 
        icon={mockIcon}
        title="Feature 1"
        description="Description 1"
      />
    );
    
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    
    rerender(
      <FeatureCard 
        icon={mockIcon}
        title="Feature 2"
        description="Description 2"
      />
    );
    
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
  });
});
