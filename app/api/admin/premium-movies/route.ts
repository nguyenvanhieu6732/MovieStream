// app/api/admin/premium-movies/route.ts
import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug, note } = await req.json();

  const movie = await prisma.premiumMovie.upsert({
    where: { slug },
    update: {},
    create: { slug, note },
  });

  return NextResponse.json(movie);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await req.json();

  await prisma.premiumMovie.delete({
    where: { slug },
  });

  return NextResponse.json({ success: true });
}
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const movies = await prisma.premiumMovie.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(movies);
}
