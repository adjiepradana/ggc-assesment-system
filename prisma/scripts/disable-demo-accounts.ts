import { PrismaClient, Role } from "@prisma/client";

/**
 * Deactivates legacy seeded demo accounts that use publicly-known passwords
 * (student@ggc.id / student123 and admin@ggc.id / admin123).
 *
 * Safety: the demo admin is only deactivated if at least one OTHER active admin exists,
 * so you can never lock yourself out of the admin panel.
 *
 * Usage: npm run disable-demo-accounts
 */
const prisma = new PrismaClient();

const DEMO_STUDENT = "student@ggc.id";
const DEMO_ADMIN = "admin@ggc.id";

async function main() {
  const student = await prisma.user.updateMany({
    where: { email: DEMO_STUDENT, is_active: true },
    data: { is_active: false },
  });
  console.log(
    student.count > 0
      ? `🔒 Demo student ${DEMO_STUDENT} dinonaktifkan.`
      : `ℹ️ Demo student ${DEMO_STUDENT} tidak ada / sudah nonaktif.`
  );

  const demoAdmin = await prisma.user.findUnique({ where: { email: DEMO_ADMIN } });
  if (!demoAdmin || !demoAdmin.is_active) {
    console.log(`ℹ️ Demo admin ${DEMO_ADMIN} tidak ada / sudah nonaktif.`);
    return;
  }

  const otherActiveAdmins = await prisma.user.count({
    where: { role: Role.ADMIN, is_active: true, NOT: { email: DEMO_ADMIN } },
  });

  if (otherActiveAdmins === 0) {
    console.warn(
      `⚠️ ${DEMO_ADMIN} TIDAK dinonaktifkan karena belum ada admin lain yang aktif.\n` +
        `   Set SEED_ADMIN_EMAIL & SEED_ADMIN_PASSWORD di .env, jalankan "npm run seed", lalu jalankan script ini lagi.`
    );
    process.exitCode = 1;
    return;
  }

  await prisma.user.update({ where: { email: DEMO_ADMIN }, data: { is_active: false } });
  console.log(`🔒 Demo admin ${DEMO_ADMIN} dinonaktifkan.`);
}

main()
  .catch((e) => {
    console.error("❌ Gagal menonaktifkan akun demo:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
