import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAssessmentScores } from "@/lib/scoring";
import {
  generateCareerOrientation,
  CareerProfileInput,
  assertCareerProfileSessionOwnership,
} from "@/lib/career-orientation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    let studentProfile: any = null;
    const answersRecord: Record<string, number> = {};

    studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: session.user.id },
    });

    const userSession = sessionId
      ? await prisma.assessmentSession.findUnique({
          where: { id: sessionId },
          include: {
            answers: {
              include: {
                question: true,
                question_set_item: true,
              },
            },
          },
        })
      : await prisma.assessmentSession.findFirst({
          where: { user_id: session.user.id },
          orderBy: { started_at: "desc" },
          include: {
            answers: {
              include: {
                question: true,
                question_set_item: true,
              },
            },
          },
        });

    if (!userSession) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Sesi asesmen tidak ditemukan." },
        { status: 404 }
      );
    }

    // SECURITY (F-05): Enforce session ownership check against IDOR
    if (!assertCareerProfileSessionOwnership(userSession, session.user)) {
      return NextResponse.json(
        { error: "Forbidden. Anda tidak memiliki akses ke sesi asesmen ini." },
        { status: 403 }
      );
    }

    if (userSession.answers) {
      for (const ans of userSession.answers) {
        const weight = ans.question_set_item?.scoring_weight ?? 1;
        if (weight <= 0) continue;
        const code =
          ans.question_set_item?.code || ans.question?.code || ans.question_id;
        answersRecord[code] = ans.selected_value;
      }
    }

    // INTEGRITY (F-18): Never synthesize fake answers when answers < 20
    if (Object.keys(answersRecord).length < 20) {
      return NextResponse.json(
        {
          error: "INSUFFICIENT_ANSWERS",
          message: "Minimal 20 jawaban diperlukan untuk orientasi karier.",
        },
        { status: 400 }
      );
    }

    const scoringResults = calculateAssessmentScores(
      userSession.id,
      answersRecord,
      {
        fullName:
          studentProfile?.full_name || session.user.name || "Siswa GGC",
        schoolName: studentProfile?.school_name || "SMA / SMK Sederajat",
        grade: studentProfile?.grade || "Kelas 12",
      }
    );

    const savedPreferences =
      (studentProfile as any)?.career_preferences || null;

    let profileInput: CareerProfileInput | null = null;
    if (savedPreferences) {
      profileInput = savedPreferences;
    } else if (studentProfile?.school_name || studentProfile?.grade) {
      profileInput = {
        educationLevel: studentProfile.grade?.toLowerCase().includes("smk")
          ? "SMK"
          : "SMA",
        currentMajor: "MIPA / Saintek",
        formalOrg: "",
        formalOrgRole: "Belum Ada",
        nonFormalExp: "",
        hobbyInterest: "",
        workExp: "",
        careerAspiration: "",
      };
    }

    const orientation = generateCareerOrientation(scoringResults, profileInput);

    return NextResponse.json({
      success: true,
      profile: profileInput,
      orientation,
    });
  } catch (error: any) {
    console.error("Error in GET /api/assessment/career-profile:", error);
    return NextResponse.json(
      { error: "Gagal memuat profil orientasi karir." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      sessionId,
      educationLevel,
      currentMajor,
      formalOrg,
      formalOrgRole,
      nonFormalExp,
      hobbyInterest,
      workExp,
      careerAspiration,
    } = body;

    const userSession = sessionId
      ? await prisma.assessmentSession.findUnique({
          where: { id: sessionId },
          include: {
            answers: {
              include: {
                question: true,
                question_set_item: true,
              },
            },
          },
        })
      : await prisma.assessmentSession.findFirst({
          where: { user_id: session.user.id },
          orderBy: { started_at: "desc" },
          include: {
            answers: {
              include: {
                question: true,
                question_set_item: true,
              },
            },
          },
        });

    if (!userSession) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Sesi asesmen tidak ditemukan." },
        { status: 404 }
      );
    }

    // SECURITY (F-05): Enforce session ownership check against IDOR
    if (!assertCareerProfileSessionOwnership(userSession, session.user)) {
      return NextResponse.json(
        { error: "Forbidden. Anda tidak memiliki akses ke sesi asesmen ini." },
        { status: 403 }
      );
    }

    const answersRecord: Record<string, number> = {};
    if (userSession.answers) {
      for (const ans of userSession.answers) {
        const weight = ans.question_set_item?.scoring_weight ?? 1;
        if (weight <= 0) continue;
        const code =
          ans.question_set_item?.code || ans.question?.code || ans.question_id;
        answersRecord[code] = ans.selected_value;
      }
    }

    // INTEGRITY (F-18): Never synthesize fake answers when answers < 20
    if (Object.keys(answersRecord).length < 20) {
      return NextResponse.json(
        {
          error: "INSUFFICIENT_ANSWERS",
          message: "Minimal 20 jawaban diperlukan untuk orientasi karier.",
        },
        { status: 400 }
      );
    }

    const profileInput: CareerProfileInput = {
      educationLevel: educationLevel || "SMA",
      currentMajor: currentMajor || "Umum",
      formalOrg: formalOrg || "",
      formalOrgRole: formalOrgRole || "Anggota Aktif",
      nonFormalExp: nonFormalExp || "",
      hobbyInterest: hobbyInterest || "",
      workExp: workExp || "",
      careerAspiration: careerAspiration || "",
    };

    // INTEGRITY (DISC-05, F-18): Never overwrite school_name with educationLevel or grade with currentMajor.
    // Store career preferences cleanly inside career_preferences JSON.
    const studentProfile = await prisma.studentProfile.upsert({
      where: { user_id: session.user.id },
      update: {
        career_preferences: profileInput as any,
      },
      create: {
        user_id: session.user.id,
        full_name: session.user.name || "Siswa GGC",
        career_preferences: profileInput as any,
      },
    });

    const scoringResults = calculateAssessmentScores(
      userSession.id,
      answersRecord,
      {
        fullName:
          studentProfile?.full_name || session.user.name || "Siswa GGC",
        schoolName: studentProfile?.school_name || "SMA / SMK Sederajat",
        grade: studentProfile?.grade || "Kelas 12",
      }
    );

    const orientation = generateCareerOrientation(scoringResults, profileInput);

    return NextResponse.json({
      success: true,
      message: "Profil pengalaman dan orientasi karir berhasil disimpan.",
      profile: profileInput,
      orientation,
    });
  } catch (error: any) {
    console.error("Error in POST /api/assessment/career-profile:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan orientasi karir." },
      { status: 500 }
    );
  }
}
