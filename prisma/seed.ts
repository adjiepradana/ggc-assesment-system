import { PrismaClient, Role, DimensionCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import { all84QuestionsData, defaultLikertOptions } from "../src/lib/questions-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting GGC Assessment System database seed...");

  // 1. Seed initial Admin user from environment variables (no hardcoded / guessable credentials).
  // No demo student is created: every student must register, verify, and pay.
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const adminPasswordPlain = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && adminPasswordPlain) {
    if (adminPasswordPlain.length < 12) {
      throw new Error("SEED_ADMIN_PASSWORD minimal 12 karakter.");
    }
    const adminPassword = await bcrypt.hash(adminPasswordPlain, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      // Never overwrite an existing admin's password on re-seed
      update: {},
      create: {
        email: adminEmail,
        password_hash: adminPassword,
        role: Role.ADMIN,
        email_verified: true,
        profile: {
          create: {
            full_name: "GGC Administrator",
          },
        },
      },
    });
    console.log(`✅ Admin user ensured: ${adminEmail}`);
  } else {
    console.log("ℹ️ SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD tidak di-set, melewati pembuatan admin.");
  }

  // 3. Seed 84 Questions across 7 Dimensions
  console.log(`📦 Seeding ${all84QuestionsData.length} assessment question items across 7 dimensions...`);

  for (const q of all84QuestionsData) {
    await prisma.question.upsert({
      where: { code: q.code },
      update: {
        dimension_category: q.dimension as DimensionCategory,
        subdimensi: q.subdimensi,
        question_text: q.text,
        options: defaultLikertOptions,
        is_active: true,
      },
      create: {
        code: q.code,
        dimension_category: q.dimension as DimensionCategory,
        subdimensi: q.subdimensi,
        question_text: q.text,
        options: defaultLikertOptions,
        is_active: true,
      },
    });
  }

  console.log("✅ Successfully seeded all 84 assessment questions!");
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
