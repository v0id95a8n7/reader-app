import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { getServerSession } from "~/utils/auth";

interface RequestBody {
  content: string;
  title?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as RequestBody;
    const { content, title } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Article content is required" },
        { status: 400 }
      );
    }

    const displayTitle = title ?? "Untitled Article";
    const prompt = createPrompt(displayTitle, content);

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
        { error: "Failed to generate summary" },
        { status: response.status }
      );
    }

    const data = await response.json() as { 
      choices: Array<{ message: { content: string } }> 
    };
    const summary = data.choices[0]?.message?.content ?? "Failed to generate summary";

    return NextResponse.json({ 
      summary
    });
    
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Create the prompt for summary generation
function createPrompt(title: string, content: string): string {
  const truncatedContent = content.length > 14000 
    ? content.substring(0, 14000) + "... [content truncated]"
    : content;

  return `
You are a professional summarizer. Your task is to create a concise summary of the following article.
Focus on extracting the main points and key insights.

Article Title: ${title}

Article Content:
${truncatedContent}

Provide a summary of the article in 3-5 bullet points. Focus on the main ideas, arguments, and conclusions.
`;
} 