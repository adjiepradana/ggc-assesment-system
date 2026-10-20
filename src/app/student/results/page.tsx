import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudentResultsIndexPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  let targetUrl = "/student/dashboard";

  try {
    const latestSession = await prisma.assessmentSession.findFirst({
      where: {
        user_id: session.user.id,
      },
      orderBy: { started_at: "desc" },
    });

    if (latestSession) {
      if (latestSession.status === "COMPLETED") {
        targetUrl = `/student/results/${latestSession.id}`;
      } else {
        targetUrl = "/student/assessment";
      }
    }
  } catch (error) {
    console.warn("StudentResultsIndex fallback:", error);
  }

  redirect(targetUrl);
}
