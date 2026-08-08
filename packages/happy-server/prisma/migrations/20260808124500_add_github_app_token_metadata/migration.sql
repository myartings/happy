ALTER TABLE "GithubUser"
ADD COLUMN "refreshToken" BYTEA,
ADD COLUMN "tokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "permissions" JSONB,
ADD COLUMN "authKind" TEXT NOT NULL DEFAULT 'legacy';
