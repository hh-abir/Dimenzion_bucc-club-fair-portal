import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/mongodb";
import DeviceBlock from "../../../models/DeviceBlock";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { fingerprint, club } = await request.json();

    if (!fingerprint || !club) {
      return NextResponse.json(
        { error: "Fingerprint and club are required" },
        { status: 400 }
      );
    }

    await DeviceBlock.findOneAndUpdate(
      { fingerprint, club },
      { blockedUntil: new Date(Date.now() - 1000) },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Device unblocked successfully",
    });
  } catch (error) {
    console.error("Error unblocking device:", error);
    return NextResponse.json(
      { error: "Failed to unblock device" },
      { status: 500 }
    );
  }
}
