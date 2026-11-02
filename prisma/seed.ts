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

  // 4. Seed QuestionSet v1 (qset_v1_default) and 84 QuestionSetItems
  console.log("📦 Ensuring QuestionSet v1 (qset_v1_default) and QuestionSetItems exist...");

  const defaultQSetId = "qset_v1_default";
  const defaultScoringConfig = {
    scale: "likert_1_5",
    formula: "((composite - 1)/4)*68 + 30",
    dimensions: [
      "TALENT",
      "INTEREST",
      "PERSONALITY",
      "VALUES",
      "ACADEMIC",
      "CAREER",
      "READINESS",
    ],
  };

  const questionSet = await prisma.questionSet.upsert({
    where: { version: 1 },
    update: {
      title: "GGC Study Fit Assessment Instrument v1 (84 Items)",
      is_active: true,
    },
    create: {
      id: defaultQSetId,
      version: 1,
      title: "GGC Study Fit Assessment Instrument v1 (84 Items)",
      is_active: true,
      scoring_config: defaultScoringConfig,
      published_at: new Date(),
    },
  });

  console.log(`✅ QuestionSet ensured: ${questionSet.id} (version: ${questionSet.version})`);

  // Fetch legacy questions to map legacy_question_id
  const allDbQuestions = await prisma.question.findMany({
    select: { id: true, code: true },
  });
  const legacyMap = new Map(allDbQuestions.map((item) => [item.code, item.id]));

  console.log(`📦 Ensuring 84 QuestionSetItem records for QuestionSet [${questionSet.id}]...`);

  for (let idx = 0; idx < all84QuestionsData.length; idx++) {
    const q = all84QuestionsData[idx];
    const legacyQuestionId = legacyMap.get(q.code) || `q_std_${q.code}`;

    await prisma.questionSetItem.upsert({
      where: {
        question_set_id_code: {
          question_set_id: questionSet.id,
          code: q.code,
        },
      },
      update: {
        order_index: idx + 1,
        dimension_category: q.dimension as DimensionCategory,
        subdimensi: q.subdimensi,
        question_text: q.text,
        options: defaultLikertOptions,
        scoring_weight: 1.0,
        legacy_question_id: legacyQuestionId,
      },
      create: {
        id: `qsi_v1_${q.code}`,
        question_set_id: questionSet.id,
        code: q.code,
        order_index: idx + 1,
        dimension_category: q.dimension as DimensionCategory,
        subdimensi: q.subdimensi,
        question_text: q.text,
        options: defaultLikertOptions,
        scoring_weight: 1.0,
        legacy_question_id: legacyQuestionId,
      },
    });
  }

  console.log(`✅ Successfully ensured all 84 QuestionSetItems for QuestionSet [${questionSet.id}]!`);
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
