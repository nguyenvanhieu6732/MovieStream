import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

function formatComment(comment: any, currentUserId?: string) {
  const likes = comment.likes || [];
  return {
    id: comment.id,
    parentId: comment.parentId || null,
    userId: comment.userId,
    user: comment.user?.name || "Anonymous",
    avatar: comment.user?.image || "/placeholder.svg",
    content: comment.content,
    timestamp: comment.createdAt.toLocaleString(),
    likeCount: likes.length,
    likedByMe: currentUserId ? likes.some((like: any) => like.userId === currentUserId) : false,
    replies: (comment.replies || []).map((reply: any) => formatComment(reply, currentUserId)),
  };
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
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
      where: { postId: post.id, parentId: null },
      include: {
        user: { select: { name: true, image: true } },
        likes: { select: { userId: true } },
        replies: {
          include: {
            user: { select: { name: true, image: true } },
            likes: { select: { userId: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      comments.map((c) => formatComment(c, session?.user?.id)),
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
    const { content, slug, parentId } = await req.json();
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

    if (parentId) {
      const parent = await prisma.comment.findFirst({
        where: { id: parentId, postId: post.id, parentId: null },
      });

      if (!parent) {
        return NextResponse.json({ message: "Parent comment not found" }, { status: 404 });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        postId: post.id,
        parentId: parentId || null,
      },
      include: {
        user: { select: { name: true, image: true } },
        likes: { select: { userId: true } },
        replies: true,
      },
    });

    return NextResponse.json(formatComment(comment, session.user.id), { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "Comment ID is required" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId: session.user.id, commentId: id } },
    });

    if (existingLike) {
      await prisma.commentLike.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.commentLike.create({
        data: { userId: session.user.id, commentId: id },
      });
    }

    const likeCount = await prisma.commentLike.count({ where: { commentId: id } });

    return NextResponse.json(
      { likedByMe: !existingLike, likeCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Toggle comment like error:", error);
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

    const replies = await prisma.comment.findMany({
      where: { parentId: id },
      select: { id: true },
    });
    const commentIds = [id, ...replies.map((reply) => reply.id)];

    await prisma.commentLike.deleteMany({
      where: { commentId: { in: commentIds } },
    });

    await prisma.comment.deleteMany({
      where: { parentId: id },
    });

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Comment deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
