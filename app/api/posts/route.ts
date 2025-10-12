import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log("Unauthorized POST /api/posts attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug, title, content } = await req.json();
    if (!slug || !title) {
      console.log("Invalid slug or title in POST /api/posts");
      return NextResponse.json({ message: "Slug and title are required" }, { status: 400 });
    }

    // Check if post already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(existingPost, { status: 200 });
    }

    const post = await prisma.post.create({
      data: {
        slug,
        title,
        content: content || "No description provided",
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}