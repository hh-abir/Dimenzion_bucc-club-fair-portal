import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Message from "../../../models/Message";
import Conversation from "../../../models/Conversation";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json([], { status: 200 });
    }

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .limit(100);

    return NextResponse.json(Array.isArray(messages) ? messages : []);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { content, senderName, senderType, club, conversationId } =
      await request.json();

    const message = new Message({
      content,
      senderName,
      senderType,
      club,
      conversationId,
    });

    await message.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
