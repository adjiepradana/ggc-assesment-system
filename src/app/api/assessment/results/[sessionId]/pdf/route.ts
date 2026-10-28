import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAssessmentScores } from "@/lib/scoring";
import { all84QuestionsData } from "@/lib/questions-data";
import { generateCareerOrientation } from "@/lib/career-orientation";
import React from "react";
import fs from "fs";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import ReportPdfDocument from "@/components/ReportPdfDocument";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const { sessionId } = params;

    let userSession: any = null;
    let studentProfile: any = null;
    let answersRecord: Record<string, number> = {};

    // Check if sessionId is a valid UUID format
    const isValidUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        sessionId
      );

    try {
      // 1. If valid UUID, look up by session ID
      if (isValidUuid) {
        userSession = await prisma.assessmentSession.findUnique({
          where: { id: sessionId },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            answers: {
              include: {
                question: true,
                question_set_item: true,
              },
            },
          },
        });
      }

      // 2. If session not found by direct ID or if sessionId was "preview" / "active-session",
      // find the latest session belonging to the currently logged in student
      if (!userSession && authSession.user.id) {
        userSession = await prisma.assessmentSession.findFirst({
          where: {
            user_id: authSession.user.id,
          },
          orderBy: { started_at: "desc" },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            answers: {
              include: {
                question: true,
                question_set_item: true,
              },
            },
          },
        });
      }

      // 3. Extract profile and answers if session exists
      if (userSession) {
        // RBAC check: Student can only access their own session, Admin can access any
        if (
          authSession.user.role !== "ADMIN" &&
          userSession.user_id !== authSession.user.id
        ) {
          return NextResponse.json(
            { error: "Forbidden. Anda tidak memiliki akses ke laporan ini." },
            { status: 403 }
          );
        }

        studentProfile = userSession.user?.profile;
        if (userSession.answers && userSession.answers.length > 0) {
          for (const ans of userSession.answers) {
            const weight = ans.question_set_item?.scoring_weight ?? 1;
            if (weight <= 0) continue;
            const code =
              ans.question_set_item?.code || ans.question?.code || ans.question_id;
            answersRecord[code] = ans.selected_value;
          }
        }
      }

      // 4. If profile was not attached to session, fetch directly from student_profiles table
      if (!studentProfile && authSession.user.id) {
        studentProfile = await prisma.studentProfile.findUnique({
          where: { user_id: authSession.user.id },
        });
      }
    } catch (dbErr) {
      console.warn("DB fetch fallback in pdf route:", dbErr);
    }

    // Default student profile fallback if none registered yet
    if (!studentProfile) {
      studentProfile = {
        full_name: authSession.user.name || "Siswa GGC",
        school_name: "SMA / SMK Sederajat",
        grade: "Kelas 12",
      };
    }

    // Require authentic session and answers from database
    if (!userSession) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Sesi asesmen tidak ditemukan." },
        { status: 404 }
      );
    }

    // SECURITY & INTEGRITY (F-11): Strictly require session to be COMPLETED before generating PDF report
    if (userSession.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: "SESSION_NOT_COMPLETED",
          message: "Asesmen belum diselesaikan.",
        },
        { status: 409 }
      );
    }

    if (Object.keys(answersRecord).length === 0) {
      return NextResponse.json(
        {
          error: "INCOMPLETE_DATA",
          message: "Data jawaban untuk sesi ini belum tersedia atau belum selesai dikerjakan.",
        },
        { status: 400 }
      );
    }

    const studentInfo = {
      name: studentProfile?.full_name || authSession.user.name || "Siswa GGC",
      school: studentProfile?.school_name || "SMA / SMK Sederajat",
      grade: studentProfile?.grade || "Kelas 12",
      email: authSession.user.email,
    };

    // Phase 4.6: Fetch pre-computed results directly from the database for instant PDF generation
    let results = userSession?.result_data;

    if (!results) {
      // Fallback: calculate assessment scores on the fly for legacy completed sessions
      results = calculateAssessmentScores(
        userSession?.id || sessionId,
        answersRecord,
        {
          fullName: studentInfo.name,
          schoolName: studentInfo.school,
          grade: studentInfo.grade,
        }
      );
    }

    const savedCareerProfile = (studentProfile as any)?.career_preferences || null;
    const careerOrientation = generateCareerOrientation(results, savedCareerProfile);

    // Read official logo as base64 data URI if available
    let logoSrc: string | undefined;
    try {
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        const logoBase64 = fs.readFileSync(logoPath).toString("base64");
        logoSrc = `data:image/png;base64,${logoBase64}`;
      }
    } catch (logoErr) {
      console.warn("Could not load logo for PDF:", logoErr);
    }

    // Render PDF buffer using @react-pdf/renderer
    const pdfDocument = React.createElement(ReportPdfDocument, {
      student: studentInfo,
      results,
      logoSrc,
      careerOrientation,
    }) as any;

    const pdfBuffer = await renderToBuffer(pdfDocument);

    const safeName = studentInfo.name.replace(/[^a-zA-Z0-9]/g, "_");

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="GGC_Study_Fit_Report_${safeName}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating PDF document:", error);
    return NextResponse.json(
      { error: "Gagal memproses dokumen PDF laporan." },
      { status: 500 }
    );
  }
}
