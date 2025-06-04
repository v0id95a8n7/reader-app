import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { getServerSession } from "~/utils/auth";

interface RequestBody {
  content: string;
  title?: string;
  summary: string;
  question: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as RequestBody;
    const { content, title, summary, question } = body;

    if (!content || !summary || !question) {
      return NextResponse.json(
        { error: "Article content, summary, and question are required" },
        { status: 400 }
      );
    }

    const displayTitle = title ?? "Untitled Article";
    const prompt = createFollowUpPrompt(displayTitle, content, summary, question);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://github.com/yourusername/reedr",
        "X-Title": "Reedr"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json() as { error?: string };
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate answer" },
        { status: response.status }
      );
    }

    const data = await response.json() as { 
      choices: Array<{ message: { content: string } }> 
    };
    const answer = data.choices[0]?.message?.content ?? "Failed to generate answer";

    return NextResponse.json({ 
      answer
    });
    
  } catch (error) {
    console.error("Error generating follow-up answer:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Create the prompt for follow-up questions
function createFollowUpPrompt(title: string, content: string, summary: string, question: string): string {
  const truncatedContent = content.length > 12000 
    ? content.substring(0, 12000) + "... [content truncated]"
    : content;

  return `
You are a knowledgeable assistant helping users understand an article. You have already provided a summary of the article, and now the user has a follow-up question.

Article Title: ${title}

Article Summary:
${summary}

Original Article Content:
${truncatedContent}

User Question: ${question}

Based on the article content and summary above, please provide a clear and helpful answer to the user's question. Focus on information that is available in the article. If the question cannot be answered based on the article content, politely indicate that the information is not available in this article.
`;
}
