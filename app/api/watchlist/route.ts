import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const url = new URL(req.url);
    const movieId = url.searchParams.get("movieId");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { watchlist: true },
    });

    if (!user) {
      return NextResponse.json({ watchlist: [] });
    }

    // ✅ Trường hợp hỏi 1 phim cụ thể
    if (movieId) {
      const exists = user.watchlist.some((w) => w.movieId === movieId);
      return NextResponse.json({ isSaved: exists });
    }

    // ✅ Trường hợp lấy toàn bộ danh sách
    const data = user.watchlist.map((w) => ({ movieId: w.movieId }));
    return NextResponse.json({ watchlist: data });
  } catch (err) {
    console.error("[GET /api/watchlist] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const body = await req.json();
    const movieId = String(body.movieId || "").trim();
    if (!movieId) return NextResponse.json({ message: "Missing movieId" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const exists = await prisma.watchlist.findUnique({
      where: { userId_movieId: { userId: user.id, movieId } } as any,
    });

    if (exists) {
      return NextResponse.json({ message: "EXISTS" }, { status: 200 });
    }

    await prisma.watchlist.create({
      data: { userId: user.id, movieId },
    });

    return NextResponse.json({ message: "ADDED" }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/watchlist] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const url = new URL(req.url);
    const movieIdFromQuery = url.searchParams.get("movieId");
    let movieId = movieIdFromQuery;
    if (!movieId) {
      const body = await req.json();
      movieId = body.movieId;
    }
    if (!movieId) return NextResponse.json({ message: "Missing movieId" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    await prisma.watchlist.deleteMany({
      where: { userId: user.id, movieId: String(movieId) },
    });

    return NextResponse.json({ message: "REMOVED" }, { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/watchlist] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}