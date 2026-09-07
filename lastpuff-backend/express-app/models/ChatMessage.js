import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      default: "default",
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    contextUsed: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ userId: 1, timestamp: -1 });
chatMessageSchema.index({ userId: 1, sessionId: 1 });

export const ChatMessage =
  mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
