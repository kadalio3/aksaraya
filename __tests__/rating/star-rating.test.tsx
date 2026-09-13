import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating, RatingDisplay } from '@/components/rating/star-rating';

describe('StarRating', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders 5 star buttons', () => {
        render(<StarRating value={0} onChange={mockOnChange} />);
        const stars = screen.getAllByRole('button');
        expect(stars).toHaveLength(5);
    });

    it('calls onChange when star is clicked', () => {
        render(<StarRating value={0} onChange={mockOnChange} />);
        const stars = screen.getAllByRole('button');

        fireEvent.click(stars[2]); // Click 3rd star
        expect(mockOnChange).toHaveBeenCalledWith(3);
    });

    it('does not call onChange when readonly', () => {
        render(<StarRating value={4} onChange={mockOnChange} readonly />);
        const stars = screen.getAllByRole('button');

        fireEvent.click(stars[2]);
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('disables buttons when readonly', () => {
        render(<StarRating value={4} onChange={mockOnChange} readonly />);
        const stars = screen.getAllByRole('button');
        stars.forEach(star => {
            expect(star).toBeDisabled();
        });
    });

    it('applies different sizes', () => {
        const { rerender, container } = render(<StarRating value={3} size="sm" />);
        expect(container.querySelector('svg')).toHaveClass('w-4');

        rerender(<StarRating value={3} size="lg" />);
        expect(container.querySelector('svg')).toHaveClass('w-8');
    });
});

describe('RatingDisplay', () => {
    it('renders average rating', () => {
        render(<RatingDisplay average={4.5} total={100} />);
        expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('renders total ratings count singular', () => {
        render(<RatingDisplay average={4.5} total={1} />);
        expect(screen.getByText('(1 rating)')).toBeInTheDocument();
    });

    it('renders total ratings count plural', () => {
        render(<RatingDisplay average={4.5} total={100} />);
        expect(screen.getByText('(100 ratings)')).toBeInTheDocument();
    });

    it('includes StarRating component', () => {
        render(<RatingDisplay average={4.5} total={100} />);
        const stars = screen.getAllByRole('button');
        expect(stars).toHaveLength(5);
    });
});
