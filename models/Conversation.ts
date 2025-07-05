import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        name: String,
        type: { type: String, enum: ["user", "admin"] },
        club: { type: String, enum: ["BUCC", "BURC", "BUAC"] },
      },
    ],
    club: {
      type: String,
      required: true,
      enum: ["BUCC", "BURC", "BUAC"],
    },
    lastMessage: {
      content: String,
      timestamp: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
