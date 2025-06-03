import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "~/utils/auth";
import { prisma } from "~/server/db";
import bcrypt from "bcryptjs";

interface UserUpdateRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UserUpdateRequest;
    const updates: { name?: string; password?: string } = {};

    // Handle name update
    if (body.name !== undefined) {
      updates.name = body.name;
    }

    // Handle password update
    if (body.currentPassword && body.newPassword) {
      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(
        body.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      updates.password = hashedPassword;
    } else if (body.currentPassword || body.newPassword) {
      return NextResponse.json(
        { error: "Both current and new passwords are required to update password" },
        { status: 400 },
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 },
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
