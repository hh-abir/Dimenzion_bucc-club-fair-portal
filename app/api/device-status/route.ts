import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import DeviceBlock from "../../../models/DeviceBlock";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { fingerprint } = await request.json();
    const block = await DeviceBlock.findOne({
      fingerprint,
      blockedUntil: { $gt: new Date() },
    });
    console.log("Device block check:", block);

    if (block) {
      const timeRemaining = Math.ceil(
        (block.blockedUntil.getTime() - Date.now()) / 1000
      );
      return NextResponse.json({
        blocked: true,
        timeRemaining,
        reason: block.reason,
      });
    }

    return NextResponse.json({ blocked: false });
  } catch (error) {
    console.error("Error checking device status:", error);
    return NextResponse.json({ blocked: false });
  }
}
