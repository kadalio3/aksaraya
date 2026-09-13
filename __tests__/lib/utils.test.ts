import { formatDate, estimateReadingTime, cn } from '@/lib/utils';

describe('formatDate', () => {
    it('formats date correctly', () => {
        const date = new Date('2024-01-15T12:00:00Z');
        const result = formatDate(date);
        expect(result).toMatch(/Jan|2024|15/);
    });

    it('handles string dates', () => {
        const result = formatDate('2024-01-15');
        expect(result).toMatch(/Jan|2024|15/);
    });
});

describe('estimateReadingTime', () => {
    it('returns 1 for short content', () => {
        const shortContent = 'Hello world';
        expect(estimateReadingTime(shortContent)).toBe(1);
    });

    it('calculates based on word count', () => {
        // Average reading speed is ~200 words per minute
        const longContent = Array(400).fill('word').join(' ');
        const result = estimateReadingTime(longContent);
        expect(result).toBe(2); // 400 words / 200 wpm = 2 minutes
    });

    it('handles empty content', () => {
        expect(estimateReadingTime('')).toBe(1);
    });
});

describe('cn (classname utility)', () => {
    it('merges class names', () => {
        const result = cn('class1', 'class2');
        expect(result).toBe('class1 class2');
    });

    it('handles undefined values', () => {
        const result = cn('class1', undefined, 'class2');
        expect(result).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
        const isActive = true;
        const result = cn('base', isActive && 'active');
        expect(result).toContain('active');
    });

    it('merges tailwind classes correctly', () => {
        const result = cn('px-2 py-1', 'px-4');
        expect(result).toContain('px-4');
        expect(result).not.toContain('px-2');
    });
});
