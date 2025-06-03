import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { getServerSession } from "~/utils/auth";

interface RequestBody {
  content: string;
  title?: string;
  lang?: string;
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

    // Функция для определения языка на основе текста
    const detectedLang = detectLanguage(content);
    const displayTitle = title ?? "Untitled Article";

    const prompt = createPrompt(displayTitle, content, detectedLang);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://github.com/yourusername/reader-app",
        "X-Title": "Reader App"
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
      summary,
      language: detectedLang 
    });
    
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Функция для определения языка текста по основным паттернам
function detectLanguage(text: string): string {
  // Кириллические символы для русского языка
  const cyrillicPattern = /[\u0400-\u04FF]/g;
  const cyrillicMatches = text.match(cyrillicPattern);
  
  if (cyrillicMatches && cyrillicMatches.length > 10) {
    return 'ru'; // Русский
  }
  
  // По умолчанию - английский
  return 'en';
}

// Создать соответствующий промпт в зависимости от языка
function createPrompt(title: string, content: string, lang: string): string {
  if (lang === 'ru') {
    return `
Ты профессиональный обозреватель текстов. Твоя задача - создать краткое резюме следующей статьи.
Сосредоточься на извлечении основных идей и ключевых моментов.

Заголовок статьи: ${title}

Содержание статьи:
${content.substring(0, 14000)} ${content.length > 14000 ? "... [текст сокращен]" : ""}

Предоставь резюме статьи в виде 3-5 пунктов. Сосредоточься на основных идеях, аргументах и выводах.
`;
  } else {
    return `
You are a professional summarizer. Your task is to create a concise summary of the following article.
Focus on extracting the main points and key insights.

Article Title: ${title}

Article Content:
${content.substring(0, 14000)} ${content.length > 14000 ? "... [content truncated]" : ""}

Provide a summary of the article in 3-5 bullet points. Focus on the main ideas, arguments, and conclusions.
`;
  }
} 