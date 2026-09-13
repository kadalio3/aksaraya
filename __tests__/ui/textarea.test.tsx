import { render, screen } from '@testing-library/react';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea', () => {
    it('renders with label', () => {
        render(<Textarea label="Description" />);
        expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders textarea element', () => {
        render(<Textarea placeholder="Enter description" />);
        expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('shows helper text', () => {
        render(<Textarea helperText="Max 500 characters" />);
        expect(screen.getByText('Max 500 characters')).toBeInTheDocument();
    });

    it('shows error state', () => {
        render(<Textarea error="Description is required" />);
        expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('hides helper text when error is shown', () => {
        render(<Textarea helperText="Helper" error="Error shown" />);
        expect(screen.queryByText('Helper')).not.toBeInTheDocument();
        expect(screen.getByText('Error shown')).toBeInTheDocument();
    });

    it('applies error border styles', () => {
        render(<Textarea error="Error" placeholder="test" />);
        const textarea = screen.getByPlaceholderText('test');
        expect(textarea).toHaveClass('border-red-500');
    });

    it('can be disabled', () => {
        render(<Textarea disabled placeholder="test" />);
        const textarea = screen.getByPlaceholderText('test');
        expect(textarea).toBeDisabled();
    });

    it('accepts rows prop', () => {
        render(<Textarea rows={10} placeholder="test" />);
        const textarea = screen.getByPlaceholderText('test');
        expect(textarea).toHaveAttribute('rows', '10');
    });

    it('applies custom className', () => {
        render(<Textarea className="custom-class" placeholder="test" />);
        const textarea = screen.getByPlaceholderText('test');
        expect(textarea).toHaveClass('custom-class');
    });

    it('forwards ref to textarea element', () => {
        const ref = { current: null };
        render(<Textarea ref={ref} placeholder="test" />);
        expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });
});
