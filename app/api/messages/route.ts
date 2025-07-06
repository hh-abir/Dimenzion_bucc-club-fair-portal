import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Message from "../../../models/Message";

export async function GET(request: NextRequest) {
  try {
    // Ensure connection is established before any database operations
    await connectDB();

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId parameter required" },
        { status: 400 }
      );
    }

    // Now safe to make database queries
    const messages = await Message.find({ conversationId }).sort({
      timestamp: 1,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure connection is established before any database operations
    await connectDB();

    const messageData = await request.json();

    const message = new Message(messageData);
    await message.save();

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
