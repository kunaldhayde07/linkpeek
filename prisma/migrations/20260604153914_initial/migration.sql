-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "Engine" AS ENUM ('fetch', 'playwright');

-- CreateEnum
CREATE TYPE "ScreenshotFormat" AS ENUM ('png', 'jpeg', 'webp');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "avatar_url" VARCHAR(1024),
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100),
    "key_hash" VARCHAR(64) NOT NULL,
    "key_prefix" VARCHAR(20) NOT NULL,
    "last_used_at" TIMESTAMPTZ,
    "revoked_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "previews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "url_hash" VARCHAR(64) NOT NULL,
    "resolved_url" VARCHAR(2048),
    "domain" VARCHAR(255) NOT NULL,
    "title" VARCHAR(1024),
    "description" TEXT,
    "image" VARCHAR(2048),
    "favicon" VARCHAR(2048),
    "site_name" VARCHAR(255),
    "type" VARCHAR(50),
    "locale" VARCHAR(20),
    "twitter_card" VARCHAR(50),
    "twitter_title" VARCHAR(1024),
    "twitter_description" TEXT,
    "twitter_image" VARCHAR(2048),
    "content_type" VARCHAR(100),
    "charset" VARCHAR(50),
    "author" VARCHAR(255),
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "theme_color" VARCHAR(20),
    "engine" "Engine" NOT NULL DEFAULT 'fetch',
    "response_time" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "previews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_previews" (
    "collection_id" UUID NOT NULL,
    "preview_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_previews_pkey" PRIMARY KEY ("collection_id","preview_id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preview_tags" (
    "preview_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preview_tags_pkey" PRIMARY KEY ("preview_id","tag_id")
);

-- CreateTable
CREATE TABLE "api_usage" (
    "id" UUID NOT NULL,
    "api_key_id" UUID NOT NULL,
    "endpoint" VARCHAR(255) NOT NULL,
    "method" VARCHAR(10) NOT NULL,
    "status_code" INTEGER NOT NULL,
    "response_time" INTEGER NOT NULL,
    "url" VARCHAR(2048),
    "cached" BOOLEAN NOT NULL DEFAULT false,
    "engine" VARCHAR(20),
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(1024),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screenshots" (
    "id" UUID NOT NULL,
    "preview_id" UUID,
    "user_id" UUID NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "url_hash" VARCHAR(64) NOT NULL,
    "storage_path" VARCHAR(512) NOT NULL,
    "public_url" VARCHAR(1024) NOT NULL,
    "viewport_width" INTEGER NOT NULL DEFAULT 1280,
    "viewport_height" INTEGER NOT NULL DEFAULT 720,
    "file_size" INTEGER,
    "format" "ScreenshotFormat" NOT NULL DEFAULT 'png',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ,

    CONSTRAINT "screenshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");

-- CreateIndex
CREATE INDEX "previews_user_id_created_at_idx" ON "previews"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "previews_url_hash_idx" ON "previews"("url_hash");

-- CreateIndex
CREATE INDEX "previews_user_id_url_hash_idx" ON "previews"("user_id", "url_hash");

-- CreateIndex
CREATE INDEX "previews_domain_idx" ON "previews"("domain");

-- CreateIndex
CREATE INDEX "collections_user_id_idx" ON "collections"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "collections_user_id_name_key" ON "collections"("user_id", "name");

-- CreateIndex
CREATE INDEX "collection_previews_preview_id_idx" ON "collection_previews"("preview_id");

-- CreateIndex
CREATE INDEX "tags_user_id_idx" ON "tags"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "tags"("user_id", "name");

-- CreateIndex
CREATE INDEX "preview_tags_tag_id_idx" ON "preview_tags"("tag_id");

-- CreateIndex
CREATE INDEX "api_usage_api_key_id_created_at_idx" ON "api_usage"("api_key_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "api_usage_created_at_idx" ON "api_usage"("created_at" DESC);

-- CreateIndex
CREATE INDEX "api_usage_endpoint_created_at_idx" ON "api_usage"("endpoint", "created_at" DESC);

-- CreateIndex
CREATE INDEX "screenshots_url_hash_viewport_width_viewport_height_idx" ON "screenshots"("url_hash", "viewport_width", "viewport_height");

-- CreateIndex
CREATE INDEX "screenshots_user_id_created_at_idx" ON "screenshots"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "screenshots_expires_at_idx" ON "screenshots"("expires_at");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "previews" ADD CONSTRAINT "previews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_previews" ADD CONSTRAINT "collection_previews_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_previews" ADD CONSTRAINT "collection_previews_preview_id_fkey" FOREIGN KEY ("preview_id") REFERENCES "previews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preview_tags" ADD CONSTRAINT "preview_tags_preview_id_fkey" FOREIGN KEY ("preview_id") REFERENCES "previews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preview_tags" ADD CONSTRAINT "preview_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_preview_id_fkey" FOREIGN KEY ("preview_id") REFERENCES "previews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
