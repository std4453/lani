-- Prisma creates this internal table before applying migrations. Keep it out
-- of the application GraphQL API, including databases baselined during upgrade.
-- The guard also allows SQL-only migration validation without Prisma metadata.
DO $$
BEGIN
    IF to_regclass('"_prisma_migrations"') IS NOT NULL THEN
        COMMENT ON TABLE "_prisma_migrations" IS '@omit';
    END IF;
END $$;
