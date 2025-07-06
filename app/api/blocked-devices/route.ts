import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import connectDB from "../../../lib/mongodb";
import DeviceBlock from "../../../models/DeviceBlock";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { fingerprint, club, duration = 30 } = await request.json();

    const blockedUntil = new Date(Date.now() + duration * 60 * 1000);

    await DeviceBlock.findOneAndUpdate(
      { fingerprint, club },
      {
        fingerprint,
        club,
        blockedUntil,
        blockedBy: session.user.email,
        reason: `Blocked for ${duration} minutes by admin`,
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, blockedUntil });
  } catch (error) {
    console.error("Error blocking device:", error);
    return NextResponse.json(
      { error: "Failed to block device" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const club = searchParams.get("club");

    if (!club) {
      return NextResponse.json(
        { error: "Club parameter required" },
        { status: 400 }
      );
    }

    const blockedDevices = await DeviceBlock.find({
      club,
      blockedUntil: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    return NextResponse.json(blockedDevices);
  } catch (error) {
    console.error("Error fetching blocked devices:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked devices" },
      { status: 500 }
    );
  }
}
