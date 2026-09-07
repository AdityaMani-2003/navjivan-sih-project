import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    images: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],

    // Community filter fields
    userType: {
      type: String,
      enum: ["smoker", "non-smoker", "both"],
      default: "both",
      index: true,
    },

    postType: {
      type: String,
      enum: ["text", "achievement", "milestone", "challenge"],
      default: "text",
      index: true,
    },

    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    likesCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ userType: 1, createdAt: -1 });
postSchema.index({ postType: 1, createdAt: -1 });

postSchema.set("toJSON", { virtuals: true, versionKey: false });
postSchema.set("toObject", { virtuals: true, versionKey: false });

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
export default Post;
