import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input', () => {
    it('renders with label', () => {
        render(<Input label="Email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders input element', () => {
        render(<Input placeholder="Enter email" />);
        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('shows helper text', () => {
        render(<Input helperText="Enter a valid email" />);
        expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    });

    it('shows error state', () => {
        render(<Input error="Email is required" />);
        expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('hides helper text when error is shown', () => {
        render(<Input helperText="Helper" error="Error shown" />);
        expect(screen.queryByText('Helper')).not.toBeInTheDocument();
        expect(screen.getByText('Error shown')).toBeInTheDocument();
    });

    it('applies error border styles', () => {
        render(<Input error="Error" placeholder="test" />);
        const input = screen.getByPlaceholderText('test');
        expect(input).toHaveClass('border-red-500');
    });

    it('can be disabled', () => {
        render(<Input disabled placeholder="test" />);
        const input = screen.getByPlaceholderText('test');
        expect(input).toBeDisabled();
    });

    it('accepts different input types', () => {
        render(<Input type="password" placeholder="Password" />);
        const input = screen.getByPlaceholderText('Password');
        expect(input).toHaveAttribute('type', 'password');
    });

    it('applies custom className', () => {
        render(<Input className="custom-class" placeholder="test" />);
        const input = screen.getByPlaceholderText('test');
        expect(input).toHaveClass('custom-class');
    });

    it('forwards ref to input element', () => {
        const ref = { current: null };
        render(<Input ref={ref} placeholder="test" />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
});
