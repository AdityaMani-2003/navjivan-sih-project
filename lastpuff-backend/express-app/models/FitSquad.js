import mongoose from "mongoose";

const fitSquadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    goals: [
      {
        title: { type: String, required: true },
        targetDate: { type: Date },
        completionRate: { type: Number, default: 0 },
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    maxMembers: {
      type: Number,
      default: 20,
    },
  },
  { timestamps: true }
);

fitSquadSchema.index({ "members.userId": 1 });
fitSquadSchema.index({ isPublic: 1, createdAt: -1 });

export const FitSquad =
  mongoose.models.FitSquad || mongoose.model("FitSquad", fitSquadSchema);

export default FitSquad;
