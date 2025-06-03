import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/utils/auth";
import { prisma } from "~/server/db";

// In-memory cache to store summary settings that aren't in the database yet
const userSummarySettings = new Map<string, { 
  showSummaryButton: boolean;
}>();

interface SettingsRequest {
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  textAlign?: string;
  showImages?: boolean;
  showVideos?: boolean;
  showSummaryButton?: boolean;
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession();
    console.log("Settings GET - session:", session);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    const summarySettings = userSummarySettings.get(session.user.id) ?? {
      showSummaryButton: true
    };

    if (!settings) {
      // Return default settings if not found
      return NextResponse.json({
        fontSize: 18,
        fontFamily: "PT Serif",
        lineHeight: 1.6,
        textAlign: "left",
        showImages: true,
        showVideos: true,
        ...summarySettings
      });
    }

    return NextResponse.json({
      ...settings,
      ...summarySettings
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    console.log("Settings POST - session:", session);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as SettingsRequest;

    // Validate settings
    if (body.fontSize && (body.fontSize < 10 || body.fontSize > 30)) {
      return NextResponse.json(
        { error: "Font size must be between 10 and 30" },
        { status: 400 },
      );
    }

    if (body.lineHeight && (body.lineHeight < 1.0 || body.lineHeight > 3.0)) {
      return NextResponse.json(
        { error: "Line height must be between 1.0 and 3.0" },
        { status: 400 },
      );
    }

    const validFontFamilies = ["PT Serif", "PT Sans"];
    if (body.fontFamily && !validFontFamilies.includes(body.fontFamily)) {
      return NextResponse.json(
        { error: "Invalid font family" },
        { status: 400 },
      );
    }

    const validTextAligns = ["left", "center", "right", "justify"];
    if (body.textAlign && !validTextAligns.includes(body.textAlign)) {
      return NextResponse.json(
        { error: "Invalid text alignment" },
        { status: 400 },
      );
    }

    // Update the in-memory summary settings
    if (body.showSummaryButton !== undefined) {
      const currentSettings = userSummarySettings.get(session.user.id) ?? {
        showSummaryButton: true
      };
      
      userSummarySettings.set(session.user.id, {
        showSummaryButton: body.showSummaryButton ?? currentSettings.showSummaryButton
      });
      
      // Log the change to help with debugging
      console.log(`Updated summary settings for user ${session.user.id}: showSummaryButton=${body.showSummaryButton}`);
    }

    // Extract only the database fields
    const dbSettings = {
      fontSize: body.fontSize,
      fontFamily: body.fontFamily,
      lineHeight: body.lineHeight,
      textAlign: body.textAlign,
      showImages: body.showImages,
      showVideos: body.showVideos,
    };

    // Update or create settings in database
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: dbSettings,
      create: {
        userId: session.user.id,
        fontSize: body.fontSize ?? 18,
        fontFamily: body.fontFamily ?? "PT Serif",
        lineHeight: body.lineHeight ?? 1.6,
        textAlign: body.textAlign ?? "left",
        showImages: body.showImages ?? true,
        showVideos: body.showVideos ?? true,
      },
    });

    // Return combined settings
    const summarySettings = userSummarySettings.get(session.user.id) ?? {
      showSummaryButton: true
    };

    return NextResponse.json({
      ...settings,
      ...summarySettings
    });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
