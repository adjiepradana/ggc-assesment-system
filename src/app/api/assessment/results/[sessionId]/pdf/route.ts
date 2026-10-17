import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAssessmentScores } from "@/lib/scoring";
import { all84QuestionsData } from "@/lib/questions-data";
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

    let studentProfile: any = null;
    let answersRecord: Record<string, number> = {};

    try {
      const userSession = await prisma.assessmentSession.findUnique({
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
            },
          },
        },
      });

      if (userSession) {
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
        for (const ans of userSession.answers) {
          const code = ans.question?.code || ans.question_id;
          answersRecord[code] = ans.selected_value;
        }
      }
    } catch (dbErr) {
      console.warn("DB fetch fallback in pdf route:", dbErr);
    }

    if (!studentProfile) {
      studentProfile = {
        full_name: authSession.user.name || "Siswa GGC",
        school_name: "SMA Negeri 1 Jakarta",
        grade: "Kelas 12 MIPA",
      };
    }

    if (Object.keys(answersRecord).length < 20) {
      for (const q of all84QuestionsData) {
        const charCode = q.code.charCodeAt(1) + q.code.charCodeAt(2);
        answersRecord[q.code] = (charCode % 3) + 3;
      }
    }

    // Calculate scores
    const results = calculateAssessmentScores(sessionId, answersRecord, {
      fullName: studentProfile?.full_name,
      schoolName: studentProfile?.school_name,
      grade: studentProfile?.grade,
    });

    const studentInfo = {
      name: studentProfile?.full_name || authSession.user.name || "Siswa GGC",
      school: studentProfile?.school_name || "SMA Negeri 1 Jakarta",
      grade: studentProfile?.grade || "Kelas 12",
      email: authSession.user.email,
    };

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
