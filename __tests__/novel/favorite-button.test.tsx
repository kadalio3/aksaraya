import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FavoriteButton } from '@/components/novel/favorite-button';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        refresh: jest.fn(),
    }),
}));

// Mock Toast context
jest.mock('@/components/ui/toast', () => ({
    useToast: () => ({
        showToast: jest.fn(),
    }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('FavoriteButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders unfavorited state text', () => {
        render(<FavoriteButton novelId="novel-1" initialFavorited={false} />);
        expect(screen.getByText('☆ Add to Favorites')).toBeInTheDocument();
    });

    it('renders favorited state text', () => {
        render(<FavoriteButton novelId="novel-1" initialFavorited={true} />);
        expect(screen.getByText('★ Favorited')).toBeInTheDocument();
    });

    it('renders as a button', () => {
        render(<FavoriteButton novelId="novel-1" initialFavorited={false} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls fetch and updates state on click', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ favorited: true }),
        });

        render(<FavoriteButton novelId="novel-1" initialFavorited={false} />);
        const button = screen.getByRole('button');

        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
            fireEvent.click(button);
        });

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/favorite/toggle', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }));
        });

        await waitFor(() => {
            expect(screen.getByText('★ Favorited')).toBeInTheDocument();
        });
    });

    it('shows loading state while fetching', async () => {
        let resolvePromise: (value: unknown) => void;
        const pendingPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });

        (global.fetch as jest.Mock).mockReturnValueOnce(pendingPromise);

        render(<FavoriteButton novelId="novel-1" initialFavorited={false} />);
        const button = screen.getByRole('button');

        fireEvent.click(button);

        // Should show loading state
        expect(screen.getByText('...')).toBeInTheDocument();
        expect(button).toBeDisabled();

        // Resolve the promise to complete the async operation
        await act(async () => {
            resolvePromise!({
                ok: true,
                json: () => Promise.resolve({ favorited: true }),
            });
        });
    });
});
