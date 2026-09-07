import mongoose from "mongoose";

const cigaretteLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    count: { type: Number, default: 0 },
    allowance: { type: Number, default: 0 }, // daily allowance for gradual reduction
  },
  { timestamps: true }
);

// Compound index for efficient lookup
cigaretteLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("CigaretteLog", cigaretteLogSchema);
