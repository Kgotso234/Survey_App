const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

// Fix prepared statement error in development by reusing Prisma client instance
if (process.env.NODE_ENV !== 'production') {
  if (!globalThis.prisma) {
    globalThis.prisma = prisma;
  }
  module.exports = globalThis.prisma;
} else {
  module.exports = prisma;
}

// Optional: graceful shutdown to avoid potential issues
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit();
});
