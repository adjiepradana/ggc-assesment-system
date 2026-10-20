import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  let completedSessionId: string | null = null;

  try {
    const latestSession = await prisma.assessmentSession.findFirst({
      where: {
        user_id: session.user.id,
      },
      orderBy: { started_at: "desc" },
    });

    if (latestSession && latestSession.status === "COMPLETED") {
      completedSessionId = latestSession.id;
    }
  } catch (error) {
    console.warn("AssessmentLayout auto-lock verification fallback:", error);
  }

  // AUTO-LOCK: Aggressively redirect completed session away from assessment questions
  if (completedSessionId) {
    redirect(`/student/results/${completedSessionId}`);
  }

  return <>{children}</>;
}
