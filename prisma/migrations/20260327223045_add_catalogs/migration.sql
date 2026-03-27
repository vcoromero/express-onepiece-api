-- CreateEnum
CREATE TYPE "CharacterStatus" AS ENUM ('alive', 'deceased', 'unknown');

-- CreateEnum
CREATE TYPE "ShipStatus" AS ENUM ('active', 'destroyed', 'retired');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('active', 'disbanded', 'unknown');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Race" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "CharacterType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FruitType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "FruitType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "OrganizationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HakiType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(20),
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "HakiType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "alias" VARCHAR(100),
    "raceId" INTEGER,
    "age" INTEGER,
    "birthday" VARCHAR(20),
    "height" VARCHAR(20),
    "bounty" BIGINT DEFAULT 0,
    "origin" VARCHAR(100),
    "status" "CharacterStatus" NOT NULL DEFAULT 'alive',
    "description" TEXT,
    "debut" VARCHAR(100),
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevilFruit" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "japaneseName" VARCHAR(100),
    "typeId" INTEGER,
    "description" TEXT,
    "abilities" TEXT,
    "currentUserId" INTEGER,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "DevilFruit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "organizationTypeId" INTEGER,
    "leaderId" INTEGER,
    "shipId" INTEGER,
    "baseLocation" VARCHAR(100),
    "totalBounty" BIGINT DEFAULT 0,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'active',
    "description" TEXT,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ship" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "ShipStatus" NOT NULL DEFAULT 'active',
    "organizationId" INTEGER,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "Ship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterDevilFruit" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "devilFruitId" INTEGER NOT NULL,
    "acquiredDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "CharacterDevilFruit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterHaki" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "hakiTypeId" INTEGER NOT NULL,
    "masteryLevel" VARCHAR(20),
    "awakened" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "CharacterHaki_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterCharacterType" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "characterTypeId" INTEGER NOT NULL,
    "acquiredDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "CharacterCharacterType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterOrganization" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "role" VARCHAR(50),
    "joinedDate" DATE,
    "leftDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "CharacterOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Race_name_idx" ON "Race"("name");

-- CreateIndex
CREATE INDEX "CharacterType_name_idx" ON "CharacterType"("name");

-- CreateIndex
CREATE INDEX "FruitType_name_idx" ON "FruitType"("name");

-- CreateIndex
CREATE INDEX "OrganizationType_name_idx" ON "OrganizationType"("name");

-- CreateIndex
CREATE INDEX "HakiType_name_idx" ON "HakiType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");

-- CreateIndex
CREATE INDEX "Character_name_idx" ON "Character"("name");

-- CreateIndex
CREATE INDEX "Character_alias_idx" ON "Character"("alias");

-- CreateIndex
CREATE INDEX "Character_bounty_idx" ON "Character"("bounty");

-- CreateIndex
CREATE INDEX "Character_status_idx" ON "Character"("status");

-- CreateIndex
CREATE INDEX "Character_raceId_idx" ON "Character"("raceId");

-- CreateIndex
CREATE INDEX "DevilFruit_name_idx" ON "DevilFruit"("name");

-- CreateIndex
CREATE INDEX "DevilFruit_typeId_idx" ON "DevilFruit"("typeId");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Organization_organizationTypeId_idx" ON "Organization"("organizationTypeId");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "Ship_name_idx" ON "Ship"("name");

-- CreateIndex
CREATE INDEX "Ship_organizationId_idx" ON "Ship"("organizationId");

-- CreateIndex
CREATE INDEX "Ship_status_idx" ON "Ship"("status");

-- CreateIndex
CREATE INDEX "CharacterDevilFruit_characterId_idx" ON "CharacterDevilFruit"("characterId");

-- CreateIndex
CREATE INDEX "CharacterDevilFruit_devilFruitId_idx" ON "CharacterDevilFruit"("devilFruitId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterDevilFruit_characterId_devilFruitId_isCurrent_key" ON "CharacterDevilFruit"("characterId", "devilFruitId", "isCurrent");

-- CreateIndex
CREATE INDEX "CharacterHaki_characterId_idx" ON "CharacterHaki"("characterId");

-- CreateIndex
CREATE INDEX "CharacterHaki_hakiTypeId_idx" ON "CharacterHaki"("hakiTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterHaki_characterId_hakiTypeId_key" ON "CharacterHaki"("characterId", "hakiTypeId");

-- CreateIndex
CREATE INDEX "CharacterCharacterType_characterId_idx" ON "CharacterCharacterType"("characterId");

-- CreateIndex
CREATE INDEX "CharacterCharacterType_characterTypeId_idx" ON "CharacterCharacterType"("characterTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterCharacterType_characterId_characterTypeId_isCurren_key" ON "CharacterCharacterType"("characterId", "characterTypeId", "isCurrent");

-- CreateIndex
CREATE INDEX "CharacterOrganization_characterId_idx" ON "CharacterOrganization"("characterId");

-- CreateIndex
CREATE INDEX "CharacterOrganization_organizationId_idx" ON "CharacterOrganization"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterOrganization_characterId_organizationId_isCurrent_key" ON "CharacterOrganization"("characterId", "organizationId", "isCurrent");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevilFruit" ADD CONSTRAINT "DevilFruit_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "FruitType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_organizationTypeId_fkey" FOREIGN KEY ("organizationTypeId") REFERENCES "OrganizationType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ship" ADD CONSTRAINT "Ship_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterDevilFruit" ADD CONSTRAINT "CharacterDevilFruit_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterDevilFruit" ADD CONSTRAINT "CharacterDevilFruit_devilFruitId_fkey" FOREIGN KEY ("devilFruitId") REFERENCES "DevilFruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterHaki" ADD CONSTRAINT "CharacterHaki_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterHaki" ADD CONSTRAINT "CharacterHaki_hakiTypeId_fkey" FOREIGN KEY ("hakiTypeId") REFERENCES "HakiType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterCharacterType" ADD CONSTRAINT "CharacterCharacterType_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterCharacterType" ADD CONSTRAINT "CharacterCharacterType_characterTypeId_fkey" FOREIGN KEY ("characterTypeId") REFERENCES "CharacterType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterOrganization" ADD CONSTRAINT "CharacterOrganization_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterOrganization" ADD CONSTRAINT "CharacterOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
