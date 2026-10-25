import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Hanya Administrator yang memiliki hak akses." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "ALL";

    // Pagination parameters (Item 4.4: default page=1, limit=50)
    const pageNumber = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = (pageNumber - 1) * pageSize;

    const whereClause: any = {};

    // Filter by status if not ALL
    if (status !== "ALL") {
      if (Object.values(OrderStatus).includes(status as OrderStatus)) {
        whereClause.status = status as OrderStatus;
      }
    }

    // Filter by search query (order_id, customer_name, customer_email, user email/name)
    if (search) {
      whereClause.OR = [
        { order_id: { contains: search, mode: "insensitive" } },
        { customer_name: { contains: search, mode: "insensitive" } },
        { customer_email: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              {
                profile: {
                  full_name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          },
        },
      ];
    }

    // 1. Fetch paginated orders & total count in parallel
    const [orders, totalMatching] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        take: pageSize,
        skip,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              email_verified: true,
              role: true,
              profile: {
                select: {
                  full_name: true,
                  phone_number: true,
                  school_name: true,
                  grade: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    // 2. Compute global metrics via PostgreSQL aggregate & groupBy (Phase 4.4)
    const [statusGroups, revenueAggregate] = await Promise.all([
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
    ]);

    let totalOrders = 0;
    let successfulOrders = 0;
    let pendingOrders = 0;
    let failedOrders = 0;

    for (const group of statusGroups) {
      const count = group._count._all;
      totalOrders += count;
      if (group.status === "SUCCESS") {
        successfulOrders = count;
      } else if (group.status === "PENDING") {
        pendingOrders = count;
      } else {
        failedOrders += count;
      }
    }

    const totalRevenue = revenueAggregate._sum.amount || 0;

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        totalMatching,
        totalPages: Math.ceil(totalMatching / pageSize),
      },
      stats: {
        totalOrders,
        successfulOrders,
        pendingOrders,
        failedOrders,
        totalRevenue,
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin transactions:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data transaksi: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
