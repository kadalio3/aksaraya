import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
    it('renders children content', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('applies primary variant styles by default', () => {
        render(<Button>Primary</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-blue-600');
    });

    it('applies secondary variant styles', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-gray-600');
    });

    it('applies outline variant styles', () => {
        render(<Button variant="outline">Outline</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('border-2');
        expect(button).toHaveClass('border-blue-600');
    });

    it('applies ghost variant styles', () => {
        render(<Button variant="ghost">Ghost</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('text-gray-700');
    });

    it('applies danger variant styles', () => {
        render(<Button variant="danger">Danger</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-red-600');
    });

    it('handles click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click</Button>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('applies custom className', () => {
        render(<Button className="custom-class">Custom</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
    });

    it('accepts different button types', () => {
        render(<Button type="submit">Submit</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('applies small size styles', () => {
        render(<Button size="sm">Small</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('text-sm');
    });

    it('applies large size styles', () => {
        render(<Button size="lg">Large</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('text-lg');
    });
});
