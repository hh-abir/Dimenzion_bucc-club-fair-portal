import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderType: {
      type: String,
      required: true,
      enum: ["user", "admin"],
    },
    club: {
      type: String,
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    userId: {
      type: String,
      index: true, // Add index for better performance
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
