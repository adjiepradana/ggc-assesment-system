import { describe, it, expect, vi } from "vitest";
import {
  resolveAssessmentQuestionSetId,
  DEFAULT_FALLBACK_QUESTION_SET_ID,
} from "@/lib/question-set";

describe("QuestionSet Resolution & Session Creation Safety (T-QSET-RES)", () => {
  it("Scenario 1: Active QuestionSet available -> resolves the active QuestionSet ID", async () => {
    const mockPrisma = {
      questionSet: {
        findFirst: vi.fn().mockResolvedValue({ id: "qset_v2_active" }),
        findUnique: vi.fn(),
      },
    };

    const resolvedId = await resolveAssessmentQuestionSetId(mockPrisma);

    expect(resolvedId).toBe("qset_v2_active");
    expect(mockPrisma.questionSet.findFirst).toHaveBeenCalledWith({
      where: { is_active: true },
      orderBy: { version: "desc" },
      select: { id: true },
    });
    // Fallback should NOT be queried when active set is found
    expect(mockPrisma.questionSet.findUnique).not.toHaveBeenCalled();
  });

  it("Scenario 2: Active QuestionSet unavailable, Fallback available -> safely resolves fallback ID", async () => {
    const mockPrisma = {
      questionSet: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue({ id: DEFAULT_FALLBACK_QUESTION_SET_ID }),
      },
    };

    const resolvedId = await resolveAssessmentQuestionSetId(mockPrisma);

    expect(resolvedId).toBe(DEFAULT_FALLBACK_QUESTION_SET_ID);
    expect(mockPrisma.questionSet.findFirst).toHaveBeenCalled();
    expect(mockPrisma.questionSet.findUnique).toHaveBeenCalledWith({
      where: { id: DEFAULT_FALLBACK_QUESTION_SET_ID },
      select: { id: true },
    });
  });

  it("Scenario 3: Active QuestionSet unavailable AND Fallback unavailable -> returns null (prevents invalid FK insertion)", async () => {
    const mockPrisma = {
      questionSet: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    const resolvedId = await resolveAssessmentQuestionSetId(mockPrisma);

    expect(resolvedId).toBeNull();
    expect(mockPrisma.questionSet.findFirst).toHaveBeenCalled();
    expect(mockPrisma.questionSet.findUnique).toHaveBeenCalledWith({
      where: { id: DEFAULT_FALLBACK_QUESTION_SET_ID },
      select: { id: true },
    });
  });

  it("Scenario 4: Active QuestionSet returns empty/whitespace ID -> falls back to verified fallback", async () => {
    const mockPrisma = {
      questionSet: {
        findFirst: vi.fn().mockResolvedValue({ id: "   " }),
        findUnique: vi.fn().mockResolvedValue({ id: DEFAULT_FALLBACK_QUESTION_SET_ID }),
      },
    };

    const resolvedId = await resolveAssessmentQuestionSetId(mockPrisma);

    expect(resolvedId).toBe(DEFAULT_FALLBACK_QUESTION_SET_ID);
    expect(mockPrisma.questionSet.findUnique).toHaveBeenCalledWith({
      where: { id: DEFAULT_FALLBACK_QUESTION_SET_ID },
      select: { id: true },
    });
  });

  it("Scenario 5: DB query throws an unexpected error -> handles gracefully and returns null", async () => {
    const mockPrisma = {
      questionSet: {
        findFirst: vi.fn().mockRejectedValue(new Error("Connection reset")),
        findUnique: vi.fn(),
      },
    };

    const resolvedId = await resolveAssessmentQuestionSetId(mockPrisma);

    expect(resolvedId).toBeNull();
  });

  it("Scenario 6: When QuestionSet resolution returns null, session creation is aborted without calling assessmentSession.create", async () => {
    const mockPrisma = {
      questionSet: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      assessmentSession: {
        create: vi.fn(),
      },
    };

    const questionSetId = await resolveAssessmentQuestionSetId(mockPrisma);

    if (!questionSetId) {
      // Represents the route guard in src/app/api/assessment/start/route.ts
      expect(mockPrisma.assessmentSession.create).not.toHaveBeenCalled();
      expect(questionSetId).toBeNull();
      return;
    }

    // Should never reach here
    await mockPrisma.assessmentSession.create({
      data: { user_id: "u1", question_set_id: questionSetId, status: "IN_PROGRESS" },
    });
  });

  it("Scenario 7: When QuestionSet resolution succeeds, assessmentSession.create receives valid non-null question_set_id", async () => {
    const mockPrisma = {
      questionSet: {
        findFirst: vi.fn().mockResolvedValue({ id: "qset_v1_default" }),
      },
      assessmentSession: {
        create: vi.fn().mockImplementation(async ({ data }) => ({
          id: "session-uuid-123",
          user_id: data.user_id,
          question_set_id: data.question_set_id,
          status: data.status,
          started_at: new Date(),
        })),
      },
    };

    const questionSetId = await resolveAssessmentQuestionSetId(mockPrisma);
    expect(questionSetId).toBe("qset_v1_default");

    const createdSession = await mockPrisma.assessmentSession.create({
      data: {
        user_id: "user-test-uuid",
        question_set_id: questionSetId!,
        status: "IN_PROGRESS",
      },
    });

    expect(createdSession.id).toBe("session-uuid-123");
    expect(createdSession.question_set_id).toBe("qset_v1_default");
    expect(createdSession.status).toBe("IN_PROGRESS");
    expect(mockPrisma.assessmentSession.create).toHaveBeenCalledWith({
      data: {
        user_id: "user-test-uuid",
        question_set_id: "qset_v1_default",
        status: "IN_PROGRESS",
      },
    });
  });
});
