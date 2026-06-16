import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

async function fetchMovieBySlug(slug: string) {
  try {
    const res = await fetch(`https://ophim1.com/v1/api/phim/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data?.data?.item || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const url = new URL(req.url);
    const movieId = url.searchParams.get("movieId");
    const includeDetails = url.searchParams.get("includeDetails") === "1";

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(includeDetails ? { watchlist: [], movies: [] } : { watchlist: [] });
    }

    if (movieId) {
      const exists = await prisma.watchlist.findUnique({
        where: { userId_movieId: { userId: user.id, movieId } } as any,
        select: { id: true },
      });
      return NextResponse.json({ isSaved: Boolean(exists) });
    }

    const watchlist = await prisma.watchlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { movieId: true },
    });

    if (!includeDetails) {
      return NextResponse.json({ watchlist });
    }

    const movies = await Promise.allSettled(watchlist.map((item) => fetchMovieBySlug(item.movieId)));

    return NextResponse.json({
      watchlist,
      movies: movies
        .map((result) => (result.status === "fulfilled" ? result.value : null))
        .filter(Boolean),
    });
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const exists = await prisma.watchlist.findUnique({
      where: { userId_movieId: { userId: user.id, movieId } } as any,
      select: { id: true },
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
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
