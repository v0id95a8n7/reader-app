-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fontSize" INTEGER NOT NULL DEFAULT 18,
    "fontFamily" TEXT NOT NULL DEFAULT 'PT Serif',
    "lineHeight" REAL NOT NULL DEFAULT 1.6,
    "textAlign" TEXT NOT NULL DEFAULT 'left',
    "showImages" BOOLEAN NOT NULL DEFAULT true,
    "showVideos" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");
