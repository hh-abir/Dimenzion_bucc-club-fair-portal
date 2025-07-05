import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Message from "../../../models/Message";
import Conversation from "../../../models/Conversation";
import DeviceBlock from "@/models/DeviceBlock";

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

    const {
      content,
      senderName,
      senderType,
      club,
      conversationId,
      fingerprint,
    } = await request.json();

    if (fingerprint && senderType === "user") {
      const block = await DeviceBlock.findOne({
        fingerprint,
        club,
        blockedUntil: { $gt: new Date() },
      });

      if (block) {
        const timeRemaining = Math.ceil(
          (block.blockedUntil.getTime() - Date.now()) / 1000
        );
        return NextResponse.json(
          {
            blocked: true,
            timeRemaining,
            reason: block.reason,
          },
          { status: 403 }
        );
      }
    }

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
