CREATE TABLE "production"."TelegramSettings" (
    "bakeryId" INTEGER NOT NULL,
    "botToken" TEXT NOT NULL,
    "chatIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "TelegramSettings_pkey" PRIMARY KEY ("bakeryId")
);

ALTER TABLE "production"."TelegramSettings"
ADD CONSTRAINT "TelegramSettings_bakeryId_fkey"
FOREIGN KEY ("bakeryId") REFERENCES "production"."Bakery"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
