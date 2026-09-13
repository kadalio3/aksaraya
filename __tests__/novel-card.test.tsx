import { render, screen } from '@testing-library/react';
import { NovelCard } from '@/components/novel/novel-card';

describe('NovelCard', () => {
    const mockNovel = {
        id: 'novel-1',
        title: 'Test Novel Title',
        description: 'A test description for the novel',
        coverUrl: null,
        genres: 'Fantasy,Romance',
        status: 'ONGOING' as const,
        updateSchedule: 'Weekly on Mondays',
        totalChapters: 100,
        averageRating: 4.5,
        totalRatings: 50,
        author: {
            id: 'author-1',
            name: 'Test Author',
            email: 'author@test.com',
        },
        _count: {
            chapters: 25,
        },
    };

    it('renders the novel title', () => {
        render(<NovelCard novel={mockNovel} />);
        expect(screen.getByText('Test Novel Title')).toBeInTheDocument();
    });

    it('renders the author name', () => {
        render(<NovelCard novel={mockNovel} />);
        expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('renders genres', () => {
        render(<NovelCard novel={mockNovel} />);
        expect(screen.getByText('Fantasy')).toBeInTheDocument();
        expect(screen.getByText('Romance')).toBeInTheDocument();
    });

    it('renders status badge', () => {
        render(<NovelCard novel={mockNovel} />);
        expect(screen.getByText('Ongoing')).toBeInTheDocument();
    });

    it('renders update schedule', () => {
        render(<NovelCard novel={mockNovel} />);
        expect(screen.getByText('Weekly on Mondays')).toBeInTheDocument();
    });

    it('renders chapter progress', () => {
        render(<NovelCard novel={mockNovel} />);
        expect(screen.getByText('25/100 chapters')).toBeInTheDocument();
    });

    it('renders rating when available', () => {
        render(<NovelCard novel={mockNovel} />);
        expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('renders fallback avatar when no cover', () => {
        render(<NovelCard novel={mockNovel} />);
        expect(screen.getByText('T')).toBeInTheDocument(); // First letter of title
    });

    it('links to novel detail page', () => {
        render(<NovelCard novel={mockNovel} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/novel/novel-1');
    });

    it('renders Anonymous when author name is null', () => {
        const novelWithoutAuthorName = {
            ...mockNovel,
            author: { ...mockNovel.author, name: null },
        };
        render(<NovelCard novel={novelWithoutAuthorName} />);
        expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });

    it('does not render update schedule when not set', () => {
        const novelWithoutSchedule = {
            ...mockNovel,
            updateSchedule: null,
        };
        render(<NovelCard novel={novelWithoutSchedule} />);
        expect(screen.queryByText('Weekly on Mondays')).not.toBeInTheDocument();
    });

    it('does not render chapter progress when totalChapters is not set', () => {
        const novelWithoutTotal = {
            ...mockNovel,
            totalChapters: null,
        };
        render(<NovelCard novel={novelWithoutTotal} />);
        expect(screen.queryByText(/\/100 chapters/)).not.toBeInTheDocument();
    });
});
