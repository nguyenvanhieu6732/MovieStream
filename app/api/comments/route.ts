import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    console.log("Slug is missing in GET /api/comments");
    return NextResponse.json({ message: "Slug is required" }, { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post) {
      console.log(`Post not found for slug: ${slug}`);
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      comments.map((c) => ({
        id: c.id,
        userId: c.userId,
        user: c.user.name || "Anonymous",
        avatar: c.user.image || "/placeholder.svg",
        content: c.content,
        timestamp: c.createdAt.toLocaleString(),
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log("Unauthorized POST /api/comments attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, slug } = await req.json();
    if (!content || !slug || content.trim().length === 0 || content.length > 1000) {
      console.log("Invalid content or slug in POST /api/comments");
      return NextResponse.json(
        { message: "Content must be between 1 and 1000 characters and slug is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post) {
      console.log(`Post not found for slug: ${slug}`);
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        postId: post.id,
      },
      include: { user: { select: { name: true, image: true } } },
    });

    return NextResponse.json(
      {
        id: comment.id,
        userId: comment.userId,
        user: comment.user.name || "Anonymous",
        avatar: comment.user.image || "/placeholder.svg",
        content: comment.content,
        timestamp: comment.createdAt.toLocaleString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log("Unauthorized DELETE /api/comments attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      console.log("Comment ID missing in DELETE /api/comments");
      return NextResponse.json({ message: "Comment ID is required" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment || comment.userId !== session.user.id) {
      console.log(`Comment not found or unauthorized for id: ${id}`);
      return NextResponse.json({ message: "Comment not found or unauthorized" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Comment deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}