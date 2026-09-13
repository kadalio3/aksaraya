import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prismaClientSingleton = () => {
    return new PrismaClient({ adapter })
}
declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
}
export default prisma;