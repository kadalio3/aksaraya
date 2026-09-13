# Aksaraya - Complete Webnovel Platform

A modern, full-featured webnovel publishing platform built with Next.js 16, TypeScript, TailwindCSS, Prisma, and Auth.js. Allows users to read novels, authors to publish their work, and admins to moderate content.

## 🚀 Features

### For Readers
- 📚 Browse and search novels by title, genre, and tags
- 📖 Clean, distraction-free reading experience
- ⭐ Add novels to favorites
- 📊 Automatic reading progress tracking
- 🔄 "Continue Reading" feature
- 💬 Comment on chapters (optional)

### For Authors
- ✍️ Create and publish novels
- 📝 Rich text chapter editor
- 📅 Chapter scheduling and draft management
- 📈 View statistics (total novels, chapters, favorites)
- 🖼️ Upload custom cover images
- 🏷️ Add genres and tags
- 📊 Author dashboard with analytics

### For Admins
- 👥 User management
- 📚 Novel moderation
- 🛡️ Content reporting system

### Technical Features
- 🔐 Secure authentication with Auth.js v5
- 🎭 Role-based access control (USER, AUTHOR, ADMIN)
- 🗄️ MySQL database with Prisma ORM
- ✅ Input validation with Zod
- 🎨 Responsive design with TailwindCSS v4
- 🚦 Middleware-based route protection
- 🔒 Password hashing with bcrypt
- 📱 Mobile-optimized reading experience

## 📋 Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+ or MariaDB 10.6+
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd novel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/novel_db"

# Auth.js
AUTH_SECRET="your-generated-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

To generate `AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Database Setup

```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed database with sample data
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
novel/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages group
│   │   ├── login/                # Login page
│   │   └── register/             # Registration page
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── novel/                # Novel CRUD endpoints
│   │   ├── chapter/              # Chapter CRUD endpoints
│   │   ├── favorite/             # Favorite toggle endpoint
│   │   └── progress/             # Reading progress endpoint
│   ├── dashboard/                # User dashboards
│   │   ├── page.tsx              # User dashboard
│   │   ├── author/               # Author dashboard
│   │   └── admin/                # Admin dashboard
│   ├── novel/                    # Novel pages
│   │   ├── page.tsx              # Novel listing
│   │   ├── [id]/                 # Novel detail
│   │   │   ├── page.tsx          # Novel detail page
│   │   │   ├── edit/             # Novel editor
│   │   │   └── chapter/          # Chapter pages
│   │   │       ├── new/          # New chapter
│   │   │       └── [chapterId]/  # Chapter reading
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── navbar.tsx
│   │   ├── container.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   └── novel/                    # Novel-specific components
│       ├── novel-card.tsx
│       └── chapter-list.tsx
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Auth.js configuration
│   ├── validators.ts             # Zod schemas
│   └── utils.ts                  # Helper functions
├── prisma/                       # Prisma schema
│   └── schema.prisma             # Database schema
├── middleware.ts                 # Route protection
├── prisma.ts                     # Prisma client
└── env.d.ts                      # TypeScript definitions
```

## 🗄️ Database Schema

### Models

- **User**: User accounts with role-based access
- **Novel**: Published novels with metadata
- **Chapter**: Novel chapters with content
- **Comment**: Chapter comments
- **Favorite**: User favorites (many-to-many)
- **ReadingProgress**: Track user reading progress

### Roles

- `USER`: Can read novels, add favorites, track progress
- `AUTHOR`: Can create and manage novels + all USER permissions
- `ADMIN`: Full access to all features

## 🔌 API Reference

### Authentication

```
POST /api/auth/register          # Create new account
POST /api/auth/[...nextauth]     # Auth.js handlers (login/logout)
```

### Novels

```
GET    /api/novel/list           # List novels (with pagination, search, filters)
POST   /api/novel/create         # Create novel (AUTHOR only)
PUT    /api/novel/update         # Update novel (owner only)
DELETE /api/novel/delete?id=...  # Delete novel (owner only)
```

### Chapters

```
POST   /api/chapter/create       # Create chapter (owner only)
PUT    /api/chapter/update       # Update chapter (owner only)
DELETE /api/chapter/delete?id... # Delete chapter (owner only)
```

### Features

```
POST /api/favorite/toggle        # Add/remove favorite
POST /api/progress/update        # Save reading progress
```

## 🎨 UI/UX Highlights

- **Modern Design**: Gradient backgrounds, smooth transitions
- **Reading Mode**: Clean, distraction-free chapter reading
- **Responsive**: Optimized for mobile, tablet, and desktop
- **Accessibility**: Proper focus states, semantic HTML
- **Dark Mode Ready**: CSS custom properties for theming

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based session management
- Role-based middleware protection
- Ownership verification for CRUD operations
- Zod validation on all API inputs
- CSRF protection (via Auth.js)

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables (Production)

Update `.env.production`:
- Set `NEXTAUTH_URL` to your domain
- Use strong `AUTH_SECRET`
- Configure production `DATABASE_URL`

## 📚 Usage Guide

### Creating Your First Novel

1. Register as an AUTHOR
2. Go to Author Dashboard
3. Click "Create New Novel"
4. Fill in title, description, genres, tags
5. Upload cover image (optional)
6. Click "Add Chapter" to start writing

### Publishing Chapters

1. From novel detail page, click "Add Chapter"
2. Write chapter content
3. Toggle "Publish" to make it public
4. Chapters appear in order

### Reader Experience

1. Browse novels on `/novel` page
2. Use search and genre filters
3. Click novel to view details
4. Click "Start Reading" to begin
5. Progress is saved automatically

## 🧪 Testing

```bash
# TypeScript type checking
npm run build

# Start development server
npm run dev

# Database introspection
npx prisma studio
```

## 📝 License

This project is built as a demonstration of modern web development practices.

## 🙏 Credits

Built with:
- [Next.js 16](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Auth.js](https://authjs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Zod](https://zod.dev/)

---

**Happy Writing! 📖✨**
