import { PrismaClient } from '../../generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // XAMPP MySQL: root user with empty password on localhost:3306
  const poolConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'ravi_developers',
    connectionLimit: 5,
    acquireTimeout: 60000,
    connectTimeout: 60000,
    socketTimeout: 60000,
    // Use mysql_native_password for compatibility
    authPlugins: {
      mysql_native_password: () => () => Buffer.from(''),
    },
  }
  
  const adapter = new PrismaMariaDb(poolConfig)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
