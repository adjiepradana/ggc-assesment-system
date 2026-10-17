import { PrismaClient, Role, DimensionCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import { all84QuestionsData, defaultLikertOptions } from "../src/lib/questions-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting GGC Assessment System database seed...");

  // 1. Seed Default Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@ggc.id" },
    update: {},
    create: {
      email: "admin@ggc.id",
      password_hash: adminPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          full_name: "GGC Master Administrator",
          phone_number: "081122334455",
          school_name: "GGC Assessment Headquarter",
          grade: "Staff Administrator",
        },
      },
    },
  });
  console.log("✅ Admin user seeded: admin@ggc.id");

  // 2. Seed Sample Student User
  const studentPassword = await bcrypt.hash("student123", 10);
  await prisma.user.upsert({
    where: { email: "student@ggc.id" },
    update: {},
    create: {
      email: "student@ggc.id",
      password_hash: studentPassword,
      role: Role.STUDENT,
      profile: {
        create: {
          full_name: "Muhammad Kevin Pratama",
          phone_number: "081234567890",
          school_name: "SMA Negeri 1 Jakarta",
          grade: "Kelas 12 MIPA",
        },
      },
    },
  });
  console.log("✅ Sample student user seeded: student@ggc.id");

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
