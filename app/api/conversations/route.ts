import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Conversation from "../../../models/Conversation";
import DeviceBlock from "../../../models/DeviceBlock";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

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
    // Ensure connection is established before any database operations
    await connectDB();

    const { userName, club, fingerprint, userId } = await request.json();

    if (!userName || !club || !fingerprint || !userId) {
      return NextResponse.json(
        { error: "userName, club, fingerprint, and userId are required" },
        { status: 400 }
      );
    }

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

    let conversation = await Conversation.findOne({
      userId,
      club,
      isActive: true,
    });

    if (!conversation) {
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
