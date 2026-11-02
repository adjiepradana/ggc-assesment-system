import { prisma } from "@/lib/prisma";

export const DEFAULT_FALLBACK_QUESTION_SET_ID = "qset_v1_default";

/**
 * Resolves the valid, verified QuestionSet ID for starting or creating an AssessmentSession.
 *
 * Evaluation rules:
 * 1. Queries the database for the active QuestionSet (`is_active: true`, latest version).
 * 2. If an active QuestionSet is found and has a non-empty string ID, returns that ID.
 * 3. If active QuestionSet is not found (or inactive), verifies whether the fallback QuestionSet
 *    `DEFAULT_FALLBACK_QUESTION_SET_ID` ('qset_v1_default') exists in the database.
 * 4. If the fallback exists in the database, returns its ID.
 * 5. If NEITHER an active QuestionSet NOR the fallback QuestionSet exists in the database,
 *    returns `null` to prevent creating an AssessmentSession with a foreign key violation or null ID.
 */
export async function resolveAssessmentQuestionSetId(
  prismaClient: any = prisma
): Promise<string | null> {
  try {
    // 1. Attempt to find the active published QuestionSet
    const activeQuestionSet = await prismaClient.questionSet.findFirst({
      where: { is_active: true },
      orderBy: { version: "desc" },
      select: { id: true },
    });

    if (
      activeQuestionSet?.id &&
      typeof activeQuestionSet.id === "string" &&
      activeQuestionSet.id.trim() !== ""
    ) {
      return activeQuestionSet.id.trim();
    }

    // 2. Active QuestionSet not found; verify if the default fallback exists in the DB
    const fallbackQuestionSet = await prismaClient.questionSet.findUnique({
      where: { id: DEFAULT_FALLBACK_QUESTION_SET_ID },
      select: { id: true },
    });

    if (
      fallbackQuestionSet?.id &&
      typeof fallbackQuestionSet.id === "string" &&
      fallbackQuestionSet.id.trim() !== ""
    ) {
      return fallbackQuestionSet.id.trim();
    }

    // 3. Neither active nor fallback QuestionSet is available in the database
    return null;
  } catch (error) {
    console.error("[QuestionSet] Error resolving active QuestionSet ID:", error);
    return null;
  }
}
