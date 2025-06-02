import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { hashPassword } from "~/utils/auth";

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as RegisterRequest;
    const { email, password, name } = body;
    console.log("Registration attempt:", { email, name, passwordProvided: !!password });

    // Validate input
    if (!email || !password) {
      console.log("Registration failed: missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Registration failed: user already exists");
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    console.log("Hashing password...");
    const hashedPassword = await hashPassword(password);
    console.log("Password hashed successfully");

    // Create user
    console.log("Creating user in database...");
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    console.log("User created successfully:", user.id);

    // Return user without password
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 },
    );
  }
}
