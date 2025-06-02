import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "~/utils/auth";
import { prisma } from "~/server/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession();
    console.log("DELETE article session:", session);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const article = await prisma.savedArticle.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this article" },
        { status: 403 },
      );
    }

    await prisma.savedArticle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete article error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
