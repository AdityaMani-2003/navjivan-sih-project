import GeoHotspot from "../models/GeoHotspot.js";

// GET /api/geofencing/hotspots?lat=X&lng=Y&radius=5000
export const getNearbyHotspots = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseInt(radius) || 5000; // default 5km

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ success: false, message: "lat and lng query params required" });
    }

    const hotspots = await GeoHotspot.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: maxDistance,
        },
      },
    }).limit(50).lean();

    return res.status(200).json({ success: true, hotspots });
  } catch (err) {
    console.error("Get hotspots error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching hotspots" });
  }
};

// POST /api/geofencing/hotspots
export const addHotspot = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { latitude, longitude, name, radius } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "latitude and longitude required" });
    }

    const hotspot = await GeoHotspot.create({
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      name: name || "Smoking Hotspot",
      addedBy: userId,
      radius: radius || 50,
    });

    return res.status(201).json({ success: true, hotspot });
  } catch (err) {
    console.error("Add hotspot error:", err);
    return res.status(500).json({ success: false, message: "Server error adding hotspot" });
  }
};
