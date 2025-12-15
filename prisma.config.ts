// Prisma configuration for Prisma 7+ (CommonJS for CLI compatibility)
// Keep this file present per project requirements.
module.exports = {
    datasource: {
        url: process.env.DATABASE_URL,
    },
};
