import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Club from "@/models/Club";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const existingClub = await Club.findOne({ clubId: body.clubId });
    if (existingClub) {
      const updatedClub = await Club.findOneAndUpdate(
        { clubId: body.clubId },
        body,
        { new: true }
      );
      return NextResponse.json(
        { message: "Club updated successfully", club: updatedClub },
        { status: 200 }
      );
    } else {
      const club = new Club(body);
      await club.save();
      return NextResponse.json(
        { message: "Club created successfully", club },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error saving club:", error);
    return NextResponse.json({ error: "Failed to save club" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");

    if (clubId) {
      const club = await Club.findOne({ clubId });
      return NextResponse.json({ club });
    }

    const clubs = await Club.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ clubs });
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}
