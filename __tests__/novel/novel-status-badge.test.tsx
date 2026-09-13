import { render, screen } from '@testing-library/react';
import { NovelStatusBadge } from '@/components/novel/novel-status-badge';

describe('NovelStatusBadge', () => {
    it('renders ONGOING status correctly', () => {
        render(<NovelStatusBadge status="ONGOING" />);
        expect(screen.getByText('Ongoing')).toBeInTheDocument();
        expect(screen.getByText('📖')).toBeInTheDocument();
    });

    it('renders COMPLETED status correctly', () => {
        render(<NovelStatusBadge status="COMPLETED" />);
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('renders HIATUS status correctly', () => {
        render(<NovelStatusBadge status="HIATUS" />);
        expect(screen.getByText('Hiatus')).toBeInTheDocument();
        expect(screen.getByText('⏸️')).toBeInTheDocument();
    });

    it('renders DROPPED status correctly', () => {
        render(<NovelStatusBadge status="DROPPED" />);
        expect(screen.getByText('Dropped')).toBeInTheDocument();
        expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('applies correct color for ONGOING', () => {
        const { container } = render(<NovelStatusBadge status="ONGOING" />);
        expect(container.firstChild).toHaveClass('bg-blue-100');
        expect(container.firstChild).toHaveClass('text-blue-700');
    });

    it('applies correct color for COMPLETED', () => {
        const { container } = render(<NovelStatusBadge status="COMPLETED" />);
        expect(container.firstChild).toHaveClass('bg-green-100');
        expect(container.firstChild).toHaveClass('text-green-700');
    });

    it('applies correct color for HIATUS', () => {
        const { container } = render(<NovelStatusBadge status="HIATUS" />);
        expect(container.firstChild).toHaveClass('bg-yellow-100');
        expect(container.firstChild).toHaveClass('text-yellow-700');
    });

    it('applies correct color for DROPPED', () => {
        const { container } = render(<NovelStatusBadge status="DROPPED" />);
        expect(container.firstChild).toHaveClass('bg-gray-100');
        expect(container.firstChild).toHaveClass('text-gray-700');
    });

    it('applies custom className', () => {
        const { container } = render(<NovelStatusBadge status="ONGOING" className="custom-class" />);
        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders as span element', () => {
        const { container } = render(<NovelStatusBadge status="ONGOING" />);
        expect(container.firstChild?.nodeName).toBe('SPAN');
    });
});
