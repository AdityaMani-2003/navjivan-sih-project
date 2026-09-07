import mongoose from "mongoose";

const geoHotspotSchema = new mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    name: { type: String, default: "Smoking Hotspot" },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verifiedCount: { type: Number, default: 1 },
    radius: { type: Number, default: 50 }, // meters
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Geospatial index for nearby queries
geoHotspotSchema.index({ location: "2dsphere" });

export default mongoose.model("GeoHotspot", geoHotspotSchema);
