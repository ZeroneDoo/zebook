import { PrismaClient } from "../app/generated/prisma/client"; 
import { PrismaMariaDb } from "@prisma/adapter-mariadb"; 
const globalForPrisma = global as unknown as {
  prisma: PrismaClient; 
}; 
const adapter = new PrismaMariaDb({ 
    host: "localhost",
    port: 3306,
    user: "root",
    database: 'e_perpus',
    password: '',
    connectionLimit: 5,
}); 
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, 
  }); 
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 
export default prisma; 