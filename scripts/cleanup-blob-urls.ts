import prisma from "../prisma";

async function cleanupBlobUrls() {
    const novels = await prisma.novel.findMany({
        where: {
            coverUrl: { startsWith: "blob:" },
        },
        select: { id: true, title: true, coverUrl: true },
    });

    console.log(`Found ${novels.length} novel(s) with broken blob URLs:\n`);

    for (const novel of novels) {
        console.log(`  - "${novel.title}" (${novel.coverUrl?.substring(0, 40)}...)`);
        await prisma.novel.update({
            where: { id: novel.id },
            data: { coverUrl: null },
        });
    }

    console.log(`\nCleaned up ${novels.length} novel(s). Done!`);
    process.exit(0);
}

cleanupBlobUrls().catch((e) => {
    console.error(e);
    process.exit(1);
});
