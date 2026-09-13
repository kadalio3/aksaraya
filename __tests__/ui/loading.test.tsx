import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingPage, LoadingCard } from '@/components/ui/loading';

describe('LoadingSpinner', () => {
    it('renders spinner', () => {
        const { container } = render(<LoadingSpinner />);
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('applies small size', () => {
        const { container } = render(<LoadingSpinner size="sm" />);
        expect(container.querySelector('.h-4')).toBeInTheDocument();
    });

    it('applies medium size by default', () => {
        const { container } = render(<LoadingSpinner />);
        expect(container.querySelector('.h-8')).toBeInTheDocument();
    });

    it('applies large size', () => {
        const { container } = render(<LoadingSpinner size="lg" />);
        expect(container.querySelector('.h-12')).toBeInTheDocument();
    });
});

describe('LoadingPage', () => {
    it('renders with default message', () => {
        render(<LoadingPage />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
        render(<LoadingPage message="Please wait..." />);
        expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });
});

describe('LoadingCard', () => {
    it('renders skeleton card', () => {
        const { container } = render(<LoadingCard />);
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
});
