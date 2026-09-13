import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
    it('renders children content', () => {
        render(<Badge>Test Badge</Badge>);
        expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('applies default variant styles', () => {
        render(<Badge>Default</Badge>);
        const badge = screen.getByText('Default');
        expect(badge).toHaveClass('bg-gray-100');
        expect(badge).toHaveClass('text-gray-700');
    });

    it('applies primary variant styles', () => {
        render(<Badge variant="primary">Primary</Badge>);
        const badge = screen.getByText('Primary');
        expect(badge).toHaveClass('bg-blue-100');
        expect(badge).toHaveClass('text-blue-700');
    });

    it('applies success variant styles', () => {
        render(<Badge variant="success">Success</Badge>);
        const badge = screen.getByText('Success');
        expect(badge).toHaveClass('bg-green-100');
        expect(badge).toHaveClass('text-green-700');
    });

    it('applies warning variant styles', () => {
        render(<Badge variant="warning">Warning</Badge>);
        const badge = screen.getByText('Warning');
        expect(badge).toHaveClass('bg-yellow-100');
        expect(badge).toHaveClass('text-yellow-700');
    });

    it('applies danger variant styles', () => {
        render(<Badge variant="danger">Danger</Badge>);
        const badge = screen.getByText('Danger');
        expect(badge).toHaveClass('bg-red-100');
        expect(badge).toHaveClass('text-red-700');
    });

    it('applies info variant styles', () => {
        render(<Badge variant="info">Info</Badge>);
        const badge = screen.getByText('Info');
        expect(badge).toHaveClass('bg-cyan-100');
        expect(badge).toHaveClass('text-cyan-700');
    });

    it('applies small size styles', () => {
        render(<Badge size="sm">Small</Badge>);
        const badge = screen.getByText('Small');
        expect(badge).toHaveClass('text-xs');
    });

    it('applies medium size styles by default', () => {
        render(<Badge>Medium</Badge>);
        const badge = screen.getByText('Medium');
        expect(badge).toHaveClass('text-sm');
    });

    it('applies large size styles', () => {
        render(<Badge size="lg">Large</Badge>);
        const badge = screen.getByText('Large');
        expect(badge).toHaveClass('text-base');
    });

    it('applies custom className', () => {
        render(<Badge className="custom-class">Custom</Badge>);
        const badge = screen.getByText('Custom');
        expect(badge).toHaveClass('custom-class');
    });

    it('renders as span element', () => {
        render(<Badge>Span</Badge>);
        const badge = screen.getByText('Span');
        expect(badge.tagName).toBe('SPAN');
    });
});
