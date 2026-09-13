import {
    registerSchema,
    loginSchema,
    createNovelSchema,
    updateNovelSchema,
    createChapterSchema,
    createCommentSchema,
    toggleFavoriteSchema,
    updateProgressSchema,
} from '@/lib/validators';

describe('registerSchema', () => {
    it('validates correct registration input', () => {
        const validInput = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
        };
        expect(() => registerSchema.parse(validInput)).not.toThrow();
    });

    it('rejects short name', () => {
        const invalidInput = {
            name: 'J',
            email: 'john@example.com',
            password: 'password123',
        };
        expect(() => registerSchema.parse(invalidInput)).toThrow();
    });

    it('rejects invalid email', () => {
        const invalidInput = {
            name: 'John Doe',
            email: 'invalid-email',
            password: 'password123',
        };
        expect(() => registerSchema.parse(invalidInput)).toThrow();
    });

    it('rejects short password', () => {
        const invalidInput = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'short',
        };
        expect(() => registerSchema.parse(invalidInput)).toThrow();
    });
});

describe('loginSchema', () => {
    it('validates correct login input', () => {
        const validInput = {
            email: 'john@example.com',
            password: 'password123',
        };
        expect(() => loginSchema.parse(validInput)).not.toThrow();
    });

    it('rejects empty password', () => {
        const invalidInput = {
            email: 'john@example.com',
            password: '',
        };
        expect(() => loginSchema.parse(invalidInput)).toThrow();
    });
});

describe('createNovelSchema', () => {
    it('validates correct novel input', () => {
        const validInput = {
            title: 'My Novel',
            description: 'A great story about adventure and magic.',
            genres: 'Fantasy,Adventure',
        };
        expect(() => createNovelSchema.parse(validInput)).not.toThrow();
    });

    it('rejects empty title', () => {
        const invalidInput = {
            title: '',
            description: 'A great story about adventure.',
            genres: 'Fantasy',
        };
        expect(() => createNovelSchema.parse(invalidInput)).toThrow();
    });

    it('rejects short description', () => {
        const invalidInput = {
            title: 'My Novel',
            description: 'Short',
            genres: 'Fantasy',
        };
        expect(() => createNovelSchema.parse(invalidInput)).toThrow();
    });

    it('accepts optional fields', () => {
        const validInput = {
            title: 'My Novel',
            description: 'A great story about adventure and magic.',
            genres: 'Fantasy',
            status: 'ONGOING' as const,
            updateSchedule: 'Weekly on Mondays',
            totalChapters: 100,
        };
        expect(() => createNovelSchema.parse(validInput)).not.toThrow();
    });
});

describe('createChapterSchema', () => {
    it('validates correct chapter input', () => {
        const validInput = {
            novelId: 'novel-123',
            title: 'Chapter 1: The Beginning',
            content: 'Once upon a time...',
        };
        expect(() => createChapterSchema.parse(validInput)).not.toThrow();
    });

    it('rejects empty title', () => {
        const invalidInput = {
            novelId: 'novel-123',
            title: '',
            content: 'Content here...',
        };
        expect(() => createChapterSchema.parse(invalidInput)).toThrow();
    });
});

describe('createCommentSchema', () => {
    it('validates correct comment input', () => {
        const validInput = {
            chapterId: 'chapter-123',
            content: 'Great chapter!',
        };
        expect(() => createCommentSchema.parse(validInput)).not.toThrow();
    });

    it('rejects empty content', () => {
        const invalidInput = {
            chapterId: 'chapter-123',
            content: '',
        };
        expect(() => createCommentSchema.parse(invalidInput)).toThrow();
    });

    it('rejects too long content', () => {
        const invalidInput = {
            chapterId: 'chapter-123',
            content: 'a'.repeat(1001),
        };
        expect(() => createCommentSchema.parse(invalidInput)).toThrow();
    });
});

describe('toggleFavoriteSchema', () => {
    it('validates correct input', () => {
        const validInput = { novelId: 'novel-123' };
        expect(() => toggleFavoriteSchema.parse(validInput)).not.toThrow();
    });
});

describe('updateProgressSchema', () => {
    it('validates correct progress input', () => {
        const validInput = {
            novelId: 'novel-123',
            chapterId: 'chapter-123',
            progress: 50,
        };
        expect(() => updateProgressSchema.parse(validInput)).not.toThrow();
    });

    it('rejects progress over 100', () => {
        const invalidInput = {
            novelId: 'novel-123',
            chapterId: 'chapter-123',
            progress: 150,
        };
        expect(() => updateProgressSchema.parse(invalidInput)).toThrow();
    });

    it('rejects negative progress', () => {
        const invalidInput = {
            novelId: 'novel-123',
            chapterId: 'chapter-123',
            progress: -10,
        };
        expect(() => updateProgressSchema.parse(invalidInput)).toThrow();
    });
});
