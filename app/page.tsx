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
import { Search, TrendingUp, Clock, Sparkles, Star, BookOpen, Users, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const studioUrl = await getStudioUrl();
  const settings = await getSettings();

  // Run queries sequentially to avoid pool exhaustion
  const novelSelect = {
    id: true, title: true, description: true, genres: true, coverUrl: true,
    status: true, updateSchedule: true, totalChapters: true,
    averageRating: true, totalRatings: true,
    author: { select: { id: true, name: true } },
    translator: { select: { id: true, name: true, email: true } },
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

  const [totalNovels, totalChapters, totalTranslators] = await Promise.all([
    prisma.novel.count(),
    prisma.chapter.count(),
    prisma.user.count({ where: { role: "TRANSLATOR" } }),
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
              author: { name: n.author?.name || null },
              translator: { name: n.translator.name },
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


      </div>
      <Footer siteName={settings.site_name} />
    </div>
  );
}
