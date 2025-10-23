import { PrismaClient } from '../generated/prisma'

declare global {
  var __prisma__: PrismaClient | undefined
}

export const prisma =
  global.__prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.__prisma__ = prisma
}
