import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Conversation from "../../../models/Conversation";
import DeviceBlock from "../../../models/DeviceBlock";

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

    // Ensure all conversations have participants array to prevent runtime errors
    const safeConversations = conversations.map((conv) => ({
      ...conv.toObject(),
      participants: conv.participants || [],
    }));

    return NextResponse.json(safeConversations);
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

    const { userName, club, fingerprint, userId } = await request.json();

    // Validate required fields
    if (!userName || !club || !fingerprint || !userId) {
      return NextResponse.json(
        { error: "userName, club, fingerprint, and userId are required" },
        { status: 400 }
      );
    }

    // Check if device is blocked
    const block = await DeviceBlock.findOne({
      fingerprint,
      club,
      blockedUntil: { $gt: new Date() },
    });

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

    // Look for existing conversation by userId (more reliable than fingerprint)
    let conversation = await Conversation.findOne({
      userId,
      club,
      isActive: true,
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [
          { name: userName, type: "user", userId },
          { name: `${club} Admin`, type: "admin", club },
        ],
        club,
        fingerprint,
        userId,
      });
      await conversation.save();
    } else {
      // Update the user name in existing conversation if it changed
      const userParticipant = conversation.participants.find(
        (p: { type: string }) => p.type === "user"
      );
      if (userParticipant && userParticipant.name !== userName) {
        userParticipant.name = userName;
        await conversation.save();
      }
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
