import prisma from "@/prisma";
import { auth } from "@/lib/auth";
import { getStudioUrl } from "@/lib/studio";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Container } from "@/components/ui/container";
import { NovelCard } from "@/components/novel/novel-card";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { AnnouncementPanel } from "@/components/home/announcement-panel";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { RecentUpdatesList } from "@/components/home/recent-updates-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Wand2, Heart, Swords, ScanSearch, Rocket, Skull, TrendingUp, Clock, Sparkles, Star, BookOpen, Users, PenTool, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const studioUrl = await getStudioUrl();
  const settings = await getSettings();

  // Run queries sequentially to avoid pool exhaustion
  const novelSelect = {
    id: true, title: true, description: true, genres: true, coverUrl: true,
    status: true, updateSchedule: true, totalChapters: true,
    averageRating: true, totalRatings: true,
    author: { select: { id: true, name: true, email: true } },
    _count: { select: { chapters: true, favorites: true } },
  } as const;

  const featuredNovels = await prisma.novel.findMany({
    where: { featured: true },
    take: 6,
    orderBy: { updatedAt: "desc" },
    select: novelSelect,
  });

  const trendingNovels = await prisma.novel.findMany({
    take: 6,
    orderBy: { updatedAt: "desc" },
    select: novelSelect,
  });

  const newReleases = await prisma.novel.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    select: novelSelect,
  });

  const [totalNovels, totalChapters, totalAuthors] = await Promise.all([
    prisma.novel.count(),
    prisma.chapter.count(),
    prisma.user.count({ where: { role: "AUTHOR" } }),
  ]);

  const latestChapters = await prisma.chapter.findMany({
    where: { isPublished: true },
    take: 30,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      order: true,
      publishedAt: true,
      novel: {
        select: {
          id: true,
          title: true,
          coverUrl: true,
          genres: true,
        },
      },
    },
  });

  const announcements = await prisma.announcement.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const genres = [
    { name: "Fantasy", icon: Wand2, accent: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { name: "Romance", icon: Heart, accent: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/30" },
    { name: "Action", icon: Swords, accent: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" },
    { name: "Mystery", icon: ScanSearch, accent: "text-accent dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { name: "Sci-Fi", icon: Rocket, accent: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
    { name: "Horror", icon: Skull, accent: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/50" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Navbar user={session?.user} studioUrl={studioUrl} siteName={settings.site_name} />

      <section className="pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[3fr_2fr] gap-4 h-[200px] sm:h-[260px] lg:h-[300px]">
            <HeroCarousel novels={featuredNovels.map(n => ({
              id: n.id,
              title: n.title,
              description: n.description,
              coverUrl: n.coverUrl,
              averageRating: n.averageRating,
              totalRatings: n.totalRatings,
              author: { name: n.author.name },
            }))} />
            <div className="hidden lg:block">
              <AnnouncementPanel announcements={announcements.map(a => ({
                id: a.id,
                title: a.title,
                content: a.content,
                date: a.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
              }))} />
            </div>
          </div>
        </div>
      </section>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">




        <section>
          <h2 className="text-2xl font-bold font-display text-fg mb-6">Temukan Genre Favoritmu</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {genres.map((genre) => {
              const Icon = genre.icon;
              return (
                <Link
                  key={genre.name}
                  href={`/novel?genre=${genre.name}`}
                  className={`group flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 px-2 py-2.5 sm:px-4 sm:py-3.5 rounded-xl border border-border bg-surface hover:-translate-y-0.5 transition-[transform,border-color] duration-300 hover:border-accent`}
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${genre.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={genre.accent} />
                  </div>
                  <span className="font-medium text-xs sm:text-sm text-fg">{genre.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {trendingNovels.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <TrendingUp size={18} />
                <h2 className="text-lg font-bold font-display">Sedang Trending</h2>
              </div>
              <Link href="/novel?sort=trending" className="text-sm text-accent hover:opacity-80 font-medium flex items-center gap-1 transition-[opacity] duration-300">
                Lihat semua <ArrowRight size={14} />
              </Link>
            </div>
            {/* Mobile: horizontal scroll */}
            <div className="lg:hidden">
              <HorizontalScroll>
                {trendingNovels.map((novel) => (
                  <div key={novel.id} className="w-[calc((100%-24px)/3)] flex-shrink-0">
                    <NovelCard novel={novel} />
                  </div>
                ))}
              </HorizontalScroll>
            </div>
            {/* Desktop: grid */}
            <div className="hidden lg:grid grid-cols-6 gap-4">
              {trendingNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          </section>
        )}

        {newReleases.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Sparkles size={18} />
                <h2 className="text-lg font-bold font-display">Novel Terbaru</h2>
              </div>
              <Link href="/novel?sort=new" className="text-sm text-accent hover:opacity-80 font-medium flex items-center gap-1 transition-[opacity] duration-300">
                Lihat semua <ArrowRight size={14} />
              </Link>
            </div>
            {/* Mobile: horizontal scroll */}
            <div className="lg:hidden">
              <HorizontalScroll>
                {newReleases.map((novel) => (
                  <div key={novel.id} className="w-[calc((100%-24px)/3)] flex-shrink-0">
                    <NovelCard novel={novel} />
                  </div>
                ))}
              </HorizontalScroll>
            </div>
            {/* Desktop: grid */}
            <div className="hidden lg:grid grid-cols-6 gap-4">
              {newReleases.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-accent">
              <Clock size={18} />
              <h2 className="text-lg font-bold font-display">Update Terbaru</h2>
            </div>
            <Link href="/novel" className="text-sm text-accent hover:opacity-80 font-medium flex items-center gap-1 transition-[opacity] duration-300">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 sm:p-4">
            <RecentUpdatesList updates={latestChapters.map(ch => ({
              chapterId: ch.id,
              chapterTitle: ch.title,
              chapterOrder: ch.order,
              publishedAt: (ch.publishedAt || new Date()).toISOString(),
              novelId: ch.novel.id,
              novelTitle: ch.novel.title,
              novelCoverUrl: ch.novel.coverUrl,
              novelGenres: ch.novel.genres,
            }))} />
          </div>
        </section>

        <section className="relative rounded-2xl border border-border overflow-hidden">
          <div className="absolute inset-0 bg-accent/5"></div>
          <div className="relative px-5 py-8 sm:px-12 sm:py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                <PenTool size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold font-display text-fg mb-1">Punya Cerita di Kepalamu?</h2>
                <p className="text-sm sm:text-base text-muted max-w-md">
                  Kami selalu terbuka untuk penulis baru. Tanpa proses seleksi, langsung tulis dan publikasikan.
                </p>
              </div>
            </div>
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="whitespace-nowrap w-full sm:w-auto">
                Mulai Menulis <ArrowRight size={16} className="ml-2 inline" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
      <Footer siteName={settings.site_name} />
    </div>
  );
}
