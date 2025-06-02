import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "~/utils/auth";
import { prisma } from "~/server/db";

interface CreateArticleRequest {
  url: string;
  title: string;
  excerpt?: string;
}

interface ArticleResponse {
  id: string;
  url: string;
  title: string;
  excerpt?: string | null;
  date: string;
}

interface SavedArticle {
  id: string;
  url: string;
  title: string;
  excerpt: string | null;
  date: Date;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    console.log("GET articles session:", session);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articles = await prisma.savedArticle.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      select: {
        id: true,
        url: true,
        title: true,
        excerpt: true,
        date: true,
      },
    });

    const formattedArticles: ArticleResponse[] = articles.map((article: SavedArticle) => ({
      id: article.id,
      url: article.url,
      title: article.title,
      excerpt: article.excerpt,
      date: article.date.toISOString(),
    }));

    return NextResponse.json({ articles: formattedArticles });
  } catch (error) {
    console.error("Get articles error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    console.log("POST article session:", session);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateArticleRequest;
    const { url, title, excerpt } = body;

    if (!url || !title) {
      return NextResponse.json(
        { error: "URL and title are required" },
        { status: 400 },
      );
    }

    const existingArticle = await prisma.savedArticle.findFirst({
      where: {
        userId: session.user.id,
        url,
      },
    });

    if (existingArticle) {
      return NextResponse.json(
        { error: "Article with this URL already exists" },
        { status: 409 },
      );
    }

    const article = await prisma.savedArticle.create({
      data: {
        url,
        title,
        excerpt,
        userId: session.user.id,
      },
    });

    const response: ArticleResponse = {
      id: article.id,
      url: article.url,
      title: article.title,
      excerpt: article.excerpt,
      date: article.date.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
