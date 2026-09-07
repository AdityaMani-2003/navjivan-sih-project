import GeoHotspot from "../models/GeoHotspot.js";

export const getNearbyHotspots = async (req, res, next) => {
  try {
    const lat = parseFloat(req.body.lat || req.query.lat);
    const lng = parseFloat(req.body.lng || req.query.lng);
    const radius = parseInt(req.body.radiusMeters || req.query.radius) || 5000;

    if (isNaN(lat) || isNaN(lng)) {
      // Return empty array instead of crashing if coordinates aren't provided
      return res.json({ success: true, data: [] });
    }

    const hotspots = await GeoHotspot.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    })
      .limit(50)
      .lean();

    res.json({ success: true, data: hotspots, hotspots });
  } catch (err) {
    // If index isn't built yet, return all hotspots
    const all = await GeoHotspot.find().limit(20).lean();
    res.json({ success: true, data: all, hotspots: all });
  }
};

export const addHotspot = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { lat, lng, latitude, longitude, label, name, type } = req.body;

    const finalLat = parseFloat(lat ?? latitude);
    const finalLng = parseFloat(lng ?? longitude);

    if (isNaN(finalLat) || isNaN(finalLng)) {
      return res.status(400).json({ success: false, error: "lat and lng are required" });
    }

    const hotspot = await GeoHotspot.create({
      location: {
        type: "Point",
        coordinates: [finalLng, finalLat],
      },
      label: label || name || "Smoking Zone",
      type: type || "smoking_zone",
      addedBy: userId,
    });

    res.status(201).json({ success: true, data: hotspot });
  } catch (err) {
    next(err);
  }
};

export const checkEntry = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.json({ success: true, inHotspot: false });
    }

    // Check if within 50 meters of any smoking zone
    const nearby = await GeoHotspot.findOne({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: 50,
        },
      },
    }).lean();

    res.json({
      success: true,
      inHotspot: !!nearby,
      hotspot: nearby || null,
      warning: nearby
        ? `Warning: You entered a high-risk ${nearby.label} zone. Take deep breaths!`
        : null,
    });
  } catch (err) {
    res.json({ success: true, inHotspot: false });
  }
};

export default {
  getNearbyHotspots,
  addHotspot,
  checkEntry,
};
