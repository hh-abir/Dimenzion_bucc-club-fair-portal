import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      message: `Password for ${email} has been forcefully overridden.`,
    });
  } catch (error) {
    console.error("Forced password override error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
