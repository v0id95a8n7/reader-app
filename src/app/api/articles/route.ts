import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "~/utils/auth";
import { db } from "~/server/db";

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

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articles = await db.savedArticle.findMany({
      where: { userId: currentUser.id },
      orderBy: { date: "desc" },
      select: {
        id: true,
        url: true,
        title: true,
        excerpt: true,
        date: true,
      },
    });

    const formattedArticles: ArticleResponse[] = articles.map((article) => ({
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
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
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

    const existingArticle = await db.savedArticle.findFirst({
      where: {
        userId: currentUser.id,
        url,
      },
    });

    if (existingArticle) {
      return NextResponse.json(
        { error: "Article with this URL already exists" },
        { status: 409 },
      );
    }

    const article = await db.savedArticle.create({
      data: {
        url,
        title,
        excerpt,
        userId: currentUser.id,
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
