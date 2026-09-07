import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  Pressable,
  View,
  FlatList,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import {
  MapPin,
  ShieldAlert,
  Plus,
  Crosshair,
  Map as MapIcon,
  List as ListIcon,
  X,
  AlertTriangle,
  Flame,
} from "lucide-react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOW } from "../../constants/theme";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import api from "../../services/api";

const { width } = Dimensions.get("window");
const ASYNC_ZONES_KEY = "@navjivan_geofence_zones";

interface GeofenceRegion {
  identifier: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  type?: string;
}

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#12121C" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94A3B8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#12121C" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#CBD5E1" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#181826" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748B" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1E1E2E" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2A2A3C" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2E2A4A" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#181826" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0D0D14" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
];

export default function GeofencingScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [regions, setRegions] = useState<GeofenceRegion[]>([]);
  const [activeTab, setActiveTab] = useState<"map" | "list">("map");

  // Modal for new zone
  const [modalVisible, setModalVisible] = useState(false);
  const [zoneCoords, setZoneCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneRadius, setZoneRadius] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  const mapRef = useRef<MapView>(null);

  // Check Expo Go environment
  const isExpoGo =
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  // Initialize permissions & load saved hotspots
  useEffect(() => {
    (async () => {
      // 1. Load locally cached zones
      try {
        const cached = await AsyncStorage.getItem(ASYNC_ZONES_KEY);
        if (cached) {
          setRegions(JSON.parse(cached));
        }
      } catch (err) {
        console.warn("Error loading cached zones:", err);
      }

      // 2. Location permissions
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setHasPermission(false);
          return;
        }
        setHasPermission(true);

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setCurrentLocation(loc);

        // Fetch hotspots from server
        fetchServerHotspots(loc.coords.latitude, loc.coords.longitude);
      } catch (err) {
        console.warn("Location error:", err);
        setHasPermission(false);
      }
    })();
  }, []);

  const fetchServerHotspots = async (lat: number, lng: number) => {
    try {
      const res = await api.get(`/api/v1/geofencing/hotspots?lat=${lat}&lng=${lng}&radius=10000`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const serverRegions: GeofenceRegion[] = res.data.data.map((h: any) => ({
          identifier: h._id || String(Math.random()),
          name: h.label || h.name || "Smoking Hotspot",
          latitude: h.location?.coordinates ? h.location.coordinates[1] : h.latitude,
          longitude: h.location?.coordinates ? h.location.coordinates[0] : h.longitude,
          radius: h.radius || 100,
          type: h.type || "smoking_zone",
        }));

        setRegions((prev) => {
          // Merge unique identifiers
          const map = new Map<string, GeofenceRegion>();
          prev.forEach((r) => map.set(r.identifier, r));
          serverRegions.forEach((r) => map.set(r.identifier, r));
          const combined = Array.from(map.values());
          AsyncStorage.setItem(ASYNC_ZONES_KEY, JSON.stringify(combined));
          return combined;
        });
      }
    } catch (err) {
      console.warn("Failed to fetch server hotspots:", err);
    }
  };

  const centerOnUser = () => {
    if (currentLocation && mapRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_e) {}
      mapRef.current.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
    }
  };

  const handleMapLongPress = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_e) {}
    setZoneCoords(coords);
    setZoneName("");
    setZoneRadius(100);
    setModalVisible(true);
  };

  const handleCreateZone = async () => {
    if (!zoneCoords || !zoneName.trim()) {
      Alert.alert("Required", "Please provide a name for this trigger zone.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/v1/geofencing/add-hotspot", {
        latitude: zoneCoords.latitude,
        longitude: zoneCoords.longitude,
        label: zoneName.trim(),
        name: zoneName.trim(),
        radius: zoneRadius,
        type: "trigger_zone",
      });

      const newRegion: GeofenceRegion = {
        identifier: res.data?.data?._id || `zone-${Date.now()}`,
        name: zoneName.trim(),
        latitude: zoneCoords.latitude,
        longitude: zoneCoords.longitude,
        radius: zoneRadius,
        type: "trigger_zone",
      };

      const updated = [newRegion, ...regions];
      setRegions(updated);
      await AsyncStorage.setItem(ASYNC_ZONES_KEY, JSON.stringify(updated));

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_e) {}

      Toast.show({
        type: "success",
        text1: "Trigger Zone Added",
        text2: `You will be alerted when within ${zoneRadius}m of ${zoneName.trim()}`,
      });

      setModalVisible(false);
    } catch (err: any) {
      console.warn("Failed to add hotspot:", err);
      // Fallback locally
      const fallbackRegion: GeofenceRegion = {
        identifier: `local-${Date.now()}`,
        name: zoneName.trim(),
        latitude: zoneCoords.latitude,
        longitude: zoneCoords.longitude,
        radius: zoneRadius,
        type: "trigger_zone",
      };
      const updated = [fallbackRegion, ...regions];
      setRegions(updated);
      await AsyncStorage.setItem(ASYNC_ZONES_KEY, JSON.stringify(updated));
      setModalVisible(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteZone = (id: string) => {
    Alert.alert("Delete Zone", "Remove this craving trigger hotspot?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = regions.filter((r) => r.identifier !== id);
          setRegions(updated);
          await AsyncStorage.setItem(ASYNC_ZONES_KEY, JSON.stringify(updated));
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (_e) {}
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Geofencing Radar</Text>
          <Text style={styles.headerSubtitle}>
            {regions.length} Craving Hotspots Monitored
          </Text>
        </View>

        <View style={styles.tabToggle}>
          <Pressable
            onPress={() => setActiveTab("map")}
            style={[styles.toggleBtn, activeTab === "map" && styles.toggleBtnActive]}
            accessibilityRole="button"
          >
            <MapIcon size={16} color={activeTab === "map" ? COLORS.textInverse : COLORS.textMuted} />
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("list")}
            style={[styles.toggleBtn, activeTab === "list" && styles.toggleBtnActive]}
            accessibilityRole="button"
          >
            <ListIcon size={16} color={activeTab === "list" ? COLORS.textInverse : COLORS.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Permission Warning Banner if needed */}
      {hasPermission === false && (
        <View style={styles.warningBanner}>
          <AlertTriangle size={18} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Location permission is required to detect nearby smoking trigger zones.
          </Text>
        </View>
      )}

      {/* Main View */}
      {activeTab === "map" ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            customMapStyle={DARK_MAP_STYLE}
            initialRegion={{
              latitude: currentLocation?.coords.latitude || 28.6139,
              longitude: currentLocation?.coords.longitude || 77.209,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            onLongPress={handleMapLongPress}
          >
            {regions.map((region) => (
              <React.Fragment key={region.identifier}>
                <Circle
                  center={{ latitude: region.latitude, longitude: region.longitude }}
                  radius={region.radius}
                  fillColor="rgba(239, 68, 68, 0.2)"
                  strokeColor={COLORS.error}
                  strokeWidth={2}
                />
                <Marker
                  coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                  title={region.name}
                  description={`Trigger Zone (${region.radius}m)`}
                >
                  <View style={styles.markerContainer}>
                    <ShieldAlert size={20} color={COLORS.error} />
                  </View>
                </Marker>
              </React.Fragment>
            ))}
          </MapView>

          {/* Floating Action Buttons */}
          <View style={styles.floatingActions}>
            <Pressable
              onPress={centerOnUser}
              style={styles.fabBtn}
              accessibilityRole="button"
              accessibilityLabel="Center on current location"
            >
              <Crosshair size={22} color={COLORS.textPrimary} />
            </Pressable>

            <Pressable
              onPress={() => {
                if (currentLocation) {
                  setZoneCoords({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                  });
                  setZoneName("");
                  setZoneRadius(100);
                  setModalVisible(true);
                } else {
                  Alert.alert("Locating...", "Determining your current location.");
                }
              }}
              style={[styles.fabBtn, { backgroundColor: COLORS.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Add trigger zone at current spot"
            >
              <Plus size={22} color={COLORS.textInverse} />
            </Pressable>
          </View>

          {/* Map Helper Bottom Note */}
          <View style={styles.helperDrawer}>
            <Flame size={16} color={COLORS.accent} />
            <Text style={styles.helperText}>
              Long-press anywhere on the map or tap '+' to mark a tea stall or smoking hotspot.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {regions.length === 0 ? (
            <View style={styles.emptyList}>
              <MapPin size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Hotspots Added</Text>
              <Text style={styles.emptyDesc}>
                Mark local tea stalls, smoking corners, or bar areas to receive timely resistance
                interventions.
              </Text>
            </View>
          ) : (
            <FlatList
              data={regions}
              keyExtractor={(item) => item.identifier}
              contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.md }}
              renderItem={({ item }) => (
                <Card style={styles.zoneCard}>
                  <View style={styles.zoneRow}>
                    <View style={styles.zoneIconBox}>
                      <ShieldAlert size={22} color={COLORS.error} />
                    </View>
                    <View style={styles.zoneInfo}>
                      <Text style={styles.zoneName}>{item.name}</Text>
                      <Text style={styles.zoneMeta}>
                        {item.radius}m geofence • {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteZone(item.identifier)}
                      style={styles.zoneDeleteBtn}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${item.name}`}
                    >
                      <X size={18} color={COLORS.textMuted} />
                    </Pressable>
                  </View>
                </Card>
              )}
            />
          )}
        </View>
      )}

      {/* Add Hotspot Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent} elevation="high">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Craving Trigger Zone</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
              >
                <X size={20} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>ZONE NAME / TRIGGER</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Office Chai Tapri, Corner Paan Shop"
              placeholderTextColor={COLORS.textMuted}
              value={zoneName}
              onChangeText={setZoneName}
            />

            <Text style={styles.inputLabel}>GEOFENCE RADIUS</Text>
            <View style={styles.radiusSelector}>
              {[50, 100, 200, 500].map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setZoneRadius(r)}
                  style={[
                    styles.radiusChip,
                    zoneRadius === r && styles.radiusChipActive,
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.radiusChipText,
                      zoneRadius === r && styles.radiusChipTextActive,
                    ]}
                  >
                    {r}m
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={submitting ? "Saving..." : "Save Zone"}
                variant="primary"
                size="md"
                onPress={handleCreateZone}
                disabled={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  toggleBtn: {
    width: 40,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 158, 11, 0.3)",
  },
  warningText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.md,
  },
  floatingActions: {
    position: "absolute",
    right: SPACING.lg,
    bottom: 80,
    gap: SPACING.md,
  },
  fabBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.md,
  },
  helperDrawer: {
    position: "absolute",
    bottom: SPACING.md,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  helperText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyList: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  zoneCard: {
    padding: SPACING.md,
  },
  zoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  zoneIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  zoneMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  zoneDeleteBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    width: "100%",
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.lg,
    fontSize: 15,
  },
  radiusSelector: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  radiusChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  radiusChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radiusChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  radiusChipTextActive: {
    color: COLORS.textInverse,
  },
  modalActions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
});