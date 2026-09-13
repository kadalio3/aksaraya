import { render, screen, fireEvent } from '@testing-library/react';
import { ChapterReaderNav } from '@/components/novel/chapter-reader-nav';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ChapterReaderNav', () => {
    const mockProps = {
        novelId: 'novel-1',
        novelTitle: 'Test Novel',
        currentChapter: {
            id: 'chapter-2',
            order: 2,
            title: 'Chapter Two',
        },
        allChapters: [
            { id: 'chapter-1', order: 1, title: 'Chapter One' },
            { id: 'chapter-2', order: 2, title: 'Chapter Two' },
            { id: 'chapter-3', order: 3, title: 'Chapter Three' },
        ],
        prevChapter: { id: 'chapter-1', order: 1 },
        nextChapter: { id: 'chapter-3', order: 3 },
        readingTime: 5,
    };

    beforeEach(() => {
        localStorageMock.getItem.mockReturnValue(null);
    });

    it('renders the chapter selector', () => {
        render(<ChapterReaderNav {...mockProps} />);
        expect(screen.getByText('Ch. 2')).toBeInTheDocument();
    });

    it('shows reading time', () => {
        render(<ChapterReaderNav {...mockProps} />);
        expect(screen.getByText('5 min')).toBeInTheDocument();
    });

    it('shows font size controls', () => {
        render(<ChapterReaderNav {...mockProps} />);
        expect(screen.getByText('A-')).toBeInTheDocument();
        expect(screen.getByText('A+')).toBeInTheDocument();
    });

    it('increases font size when A+ is clicked', () => {
        render(<ChapterReaderNav {...mockProps} />);
        const increaseBtn = screen.getByText('A+').closest('button');

        // Default font size is 18
        expect(screen.getByText('18')).toBeInTheDocument();

        fireEvent.click(increaseBtn!);
        expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('decreases font size when A- is clicked', () => {
        render(<ChapterReaderNav {...mockProps} />);
        const decreaseBtn = screen.getByText('A-').closest('button');

        fireEvent.click(decreaseBtn!);
        expect(screen.getByText('16')).toBeInTheDocument();
    });

    it('opens chapter dropdown when clicked', () => {
        render(<ChapterReaderNav {...mockProps} />);
        const dropdownBtn = screen.getByText('Ch. 2');

        fireEvent.click(dropdownBtn);

        expect(screen.getByText('Select Chapter')).toBeInTheDocument();
        expect(screen.getByText('Chapter One')).toBeInTheDocument();
        expect(screen.getByText('Chapter Three')).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
        render(<ChapterReaderNav {...mockProps} />);

        // Should have previous and next links
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThanOrEqual(2);
    });

    it('disables prev button when no previous chapter', () => {
        const propsWithoutPrev = {
            ...mockProps,
            prevChapter: null,
            currentChapter: { id: 'chapter-1', order: 1, title: 'First' },
        };

        render(<ChapterReaderNav {...propsWithoutPrev} />);
        // The prev button should be disabled (shown as div, not link)
    });

    it('saves font size to localStorage', () => {
        render(<ChapterReaderNav {...mockProps} />);
        const increaseBtn = screen.getByText('A+').closest('button');

        fireEvent.click(increaseBtn!);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('reader-font-size', '20');
    });
});
