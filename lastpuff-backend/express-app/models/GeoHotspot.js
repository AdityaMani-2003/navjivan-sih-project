import mongoose from "mongoose";

const geoHotspotSchema = new mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedCount: {
      type: Number,
      default: 1,
    },
    type: {
      type: String,
      enum: ["smoking_zone", "high_risk_area"],
      default: "smoking_zone",
    },
    label: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

geoHotspotSchema.index({ location: "2dsphere" });

export const GeoHotspot =
  mongoose.models.GeoHotspot || mongoose.model("GeoHotspot", geoHotspotSchema);

export default GeoHotspot;
