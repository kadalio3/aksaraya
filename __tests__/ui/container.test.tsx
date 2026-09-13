import { render, screen } from '@testing-library/react';
import { Container } from '@/components/ui/container';

describe('Container', () => {
    it('renders children content', () => {
        render(<Container>Content</Container>);
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies default xl max-width', () => {
        const { container } = render(<Container>Content</Container>);
        expect(container.firstChild).toHaveClass('max-w-7xl');
    });

    it('applies sm size', () => {
        const { container } = render(<Container size="sm">Content</Container>);
        expect(container.firstChild).toHaveClass('max-w-2xl');
    });

    it('applies md size', () => {
        const { container } = render(<Container size="md">Content</Container>);
        expect(container.firstChild).toHaveClass('max-w-4xl');
    });

    it('applies lg size', () => {
        const { container } = render(<Container size="lg">Content</Container>);
        expect(container.firstChild).toHaveClass('max-w-6xl');
    });

    it('applies custom className', () => {
        const { container } = render(<Container className="custom-class">Content</Container>);
        expect(container.firstChild).toHaveClass('custom-class');
    });
});
