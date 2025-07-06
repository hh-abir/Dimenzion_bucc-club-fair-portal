import { type NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/mongodb";
import Conversation from "../../../../models/Conversation";
import Message from "../../../../models/Message";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await connectDB();

    if (!id) {
      return NextResponse.json(
        { error: "Conversation ID required" },
        { status: 400 }
      );
    }

    await Message.deleteMany({ conversationId: id });
    await Conversation.findByIdAndDelete(id);

    return NextResponse.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
