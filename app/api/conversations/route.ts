import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Conversation from "../../../models/Conversation";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const club = searchParams.get("club");

    if (!club) {
      return NextResponse.json(
        { error: "Club parameter required" },
        { status: 400 }
      );
    }

    const conversations = await Conversation.find({
      club,
      isActive: true,
    }).sort({ updatedAt: -1 });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { userName, club } = await request.json();

    let conversation = await Conversation.findOne({
      "participants.name": userName,
      club,
      isActive: true,
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { name: userName, type: "user" },
          { name: `${club} Admin`, type: "admin", club },
        ],
        club,
      });
      await conversation.save();
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
