import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
// NOTE: expo-notifications is NOT imported statically because it throws
// immediately in Expo Go SDK 53+. We use dynamic import() below instead.
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { GEOFENCING_TASK_NAME } from "../../tasks/geofencingTask";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from "../../constants/theme";
import { fetchNearbyHotspots, reportHotspot } from "../../services/api";

// ------------------------------------------------
// CONFIG
// ------------------------------------------------
const PRIMARY_COLOR = COLORS.primary; // Teal Green
const BG_COLOR = COLORS.bg; // Dark Background
const CARD_BG = COLORS.surface;
const ASYNC_ZONES_KEY = "@geofence_zones";

interface GeofenceRegion {
  identifier: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  notifyOnEnter: boolean;
  notifyOnExit: boolean;
}

export default function GeofencingScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [regions, setRegions] = useState<GeofenceRegion[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "list">("map");

  // Long-press modal for custom zone creation
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newZoneCoords, setNewZoneCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneRadius, setNewZoneRadius] = useState<number>(100);

  const mapRef = useRef<MapView>(null);

  // Check if running in Expo Go (Bug 8)
  const isExpoGo =
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  // 1. Initial Setup: Load permissions, zones, and status
  useEffect(() => {
    (async () => {
      // A. Load saved zones from AsyncStorage (Bug 4)
      try {
        const saved = await AsyncStorage.getItem(ASYNC_ZONES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setRegions(parsed);
        }
      } catch (err) {
        console.error("Failed to load saved geofence zones:", err);
      }

      // B. Notifications Permission (dynamic import to avoid Expo Go crash)
      if (!isExpoGo) {
        try {
          const Notifications = await import("expo-notifications");
          const { status: notifStatus } = await Notifications.requestPermissionsAsync();
          if (notifStatus !== "granted") {
            console.warn("Notification permission not granted for geofencing");
          }
        } catch (err) {
          console.warn("Notification permission request error:", err);
        }
      }

      // C. Location Permissions (Foreground & Background)
      try {
        const { status: foreStatus } = await Location.requestForegroundPermissionsAsync();
        if (foreStatus !== "granted") {
          setHasPermission(false);
          return;
        }

        if (!isExpoGo) {
          const { status: backStatus } = await Location.requestBackgroundPermissionsAsync();
          if (backStatus !== "granted") {
            console.log("Background location permission denied or restricted");
          }
        }

        setHasPermission(true);

        // D. Get Current Location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setCurrentLocation(location);

        // E. Check if monitoring is active
        const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCING_TASK_NAME);
        setIsMonitoring(isRegistered);
      } catch (err) {
        console.warn("Location setup error:", err);
        setHasPermission(false);
      }
    })();
  }, []);

  // Save zones to AsyncStorage helper
  const saveRegions = async (updated: GeofenceRegion[]) => {
    setRegions(updated);
    try {
      await AsyncStorage.setItem(ASYNC_ZONES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save zones to storage:", e);
    }
  };

  // 2. Add Geofence Region at Current Location
  const addCurrentLocationGeofence = async () => {
    if (!currentLocation) {
      Toast.show({ type: "error", text1: "Locating your position..." });
      return;
    }
    setNewZoneCoords({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    });
    setNewZoneName(`Trigger Zone ${regions.length + 1}`);
    setNewZoneRadius(100);
    setAddModalVisible(true);
  };

  // 3. Handle Map Long Press (Bug 6)
  const handleMapLongPress = (coords: { latitude: number; longitude: number }) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    setNewZoneCoords(coords);
    setNewZoneName(`Custom Zone ${regions.length + 1}`);
    setNewZoneRadius(100);
    setAddModalVisible(true);
  };

  // 4. Confirm Add Zone
  const confirmAddZone = async () => {
    if (!newZoneCoords) return;

    const newRegion: GeofenceRegion = {
      identifier: `zone_${Date.now()}`,
      name: newZoneName.trim() || `Zone ${regions.length + 1}`,
      latitude: newZoneCoords.latitude,
      longitude: newZoneCoords.longitude,
      radius: newZoneRadius,
      notifyOnEnter: true,
      notifyOnExit: true,
    };

    const updatedRegions = [...regions, newRegion];
    await saveRegions(updatedRegions);
    setAddModalVisible(false);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    Toast.show({
      type: "success",
      text1: "Trigger Zone Saved 📍",
      text2: `${newRegion.name} (${newZoneRadius}m radius)`,
    });

    // If already monitoring, update active geofences
    if (isMonitoring && !isExpoGo) {
      try {
        await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, updatedRegions);
      } catch (err) {
        console.warn("Failed to update active geofence monitoring:", err);
      }
    }
  };

  // 5. Delete Zone (Bug 5)
  const deleteZone = async (zoneIdentifier: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    const updated = regions.filter((r) => r.identifier !== zoneIdentifier);
    await saveRegions(updated);

    Toast.show({
      type: "success",
      text1: "Zone Deleted 🗑️",
    });

    // Update or stop geofencing task
    if (isMonitoring && !isExpoGo) {
      try {
        if (updated.length > 0) {
          await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, updated);
        } else {
          await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
          setIsMonitoring(false);
        }
      } catch (err) {
        console.warn("Error updating geofences after deletion:", err);
      }
    }
  };

  // 6. Toggle Monitoring
  const toggleMonitoring = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    if (isExpoGo) {
      Alert.alert(
        "Expo Go Notice",
        "Background task execution is disabled in Expo Go. To run real background geofencing, build with 'npx expo run:android' or EAS. Zone setup and foreground tracking work here!"
      );
      setIsMonitoring(!isMonitoring);
      return;
    }

    try {
      if (isMonitoring) {
        await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
        setIsMonitoring(false);
        Toast.show({
          type: "success",
          text1: "Monitoring Paused",
          text2: "Background alerts disabled.",
        });
      } else {
        if (regions.length === 0) {
          Toast.show({
            type: "error",
            text1: "No Zones Configured",
            text2: "Add at least one trigger zone first.",
          });
          return;
        }
        await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
        setIsMonitoring(true);
        Toast.show({
          type: "success",
          text1: "Geofencing Active 🛡️",
          text2: `Monitoring ${regions.length} trigger zones.`,
        });
      }
    } catch (e: any) {
      console.error("Geofencing toggle error:", e);
      Alert.alert("Geofencing Notice", e.message || "Failed to toggle background geofencing.");
    }
  };

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 24 }]}>
        <Ionicons name="location-outline" size={60} color="#FF3B30" style={{ marginBottom: 16 }} />
        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
          Location Permission Required
        </Text>
        <Text style={{ color: "#888888", textAlign: "center", lineHeight: 22, marginBottom: 20 }}>
          LastPuff needs location access to alert you when entering areas where you usually smoke.
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        >
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Trigger Zones</Text>
          <Text style={styles.headerSubtitle}>
            {regions.length} {regions.length === 1 ? "zone" : "zones"} configured
          </Text>
        </View>

        <TouchableOpacity onPress={toggleMonitoring} style={styles.statusToggle}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isMonitoring ? PRIMARY_COLOR : "#222222" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isMonitoring ? "#000000" : "#666666" },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isMonitoring ? "#000000" : "#FFFFFF" },
              ]}
            >
              {isMonitoring ? "ACTIVE" : "PAUSED"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Expo Go Notice Banner (Bug 8) */}
      {isExpoGo && (
        <View style={styles.expoGoBanner}>
          <Ionicons name="information-circle" size={18} color="#FFD700" />
          <Text style={styles.expoGoText}>
            Expo Go Mode: Interactive mapping & zones are active. Background alerts run natively in custom dev builds.
          </Text>
        </View>
      )}

      {/* View Switcher Tabs */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.switchTab, activeTab === "map" && styles.switchTabActive]}
          onPress={() => setActiveTab("map")}
        >
          <Ionicons name="map-outline" size={16} color={activeTab === "map" ? "#000" : "#888"} />
          <Text style={[styles.switchTabText, activeTab === "map" && styles.switchTabTextActive]}>
            Map View
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchTab, activeTab === "list" && styles.switchTabActive]}
          onPress={() => setActiveTab("list")}
        >
          <Ionicons name="list-outline" size={16} color={activeTab === "list" ? "#000" : "#888"} />
          <Text style={[styles.switchTabText, activeTab === "list" && styles.switchTabTextActive]}>
            Manage Zones ({regions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "map" ? (
        <View style={styles.mapWrapper}>
          {currentLocation ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
              }}
              showsUserLocation
              showsMyLocationButton
              customMapStyle={mapStyle}
              onLongPress={(e) => handleMapLongPress(e.nativeEvent.coordinate)}
            >
              {regions.map((region) => (
                <React.Fragment key={region.identifier}>
                  <Marker
                    coordinate={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                    }}
                    title={region.name}
                    description={`Radius: ${region.radius}m`}
                    pinColor={PRIMARY_COLOR}
                  />
                  <Circle
                    center={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                    }}
                    radius={region.radius}
                    strokeColor={PRIMARY_COLOR}
                    strokeWidth={2}
                    fillColor="rgba(57, 255, 20, 0.2)"
                  />
                </React.Fragment>
              ))}
            </MapView>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
              <Text style={{ color: "#FFFFFF", marginTop: 10 }}>Locating your GPS...</Text>
            </View>
          )}

          {/* Floating Map Hint */}
          <View style={styles.mapHintBadge}>
            <Ionicons name="finger-print-outline" size={16} color="#39FF14" />
            <Text style={styles.mapHintText}>Long-press anywhere on map to add custom zone</Text>
          </View>
        </View>
      ) : (
        /* List View */
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {regions.length === 0 ? (
            <View style={styles.emptyZonesContainer}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📍</Text>
              <Text style={styles.emptyTitle}>No Trigger Zones Yet</Text>
              <Text style={styles.emptySub}>
                Add locations where you commonly experience cravings (e.g. tobacco shops, work break corners, parking spots).
              </Text>
            </View>
          ) : (
            regions.map((region) => (
              <View key={region.identifier} style={styles.zoneCard}>
                <View style={styles.zoneIconBox}>
                  <Ionicons name="location" size={24} color={PRIMARY_COLOR} />
                </View>
                <View style={styles.zoneDetails}>
                  <Text style={styles.zoneCardName}>{region.name}</Text>
                  <Text style={styles.zoneCardCoords}>
                    Radius: {region.radius}m • Lat: {region.latitude.toFixed(4)}, Lng: {region.longitude.toFixed(4)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => deleteZone(region.identifier)}
                  style={styles.zoneDeleteBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Bottom Action Bar */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={addCurrentLocationGeofence}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate-circle" size={22} color="#000000" />
          <Text style={styles.btnText}>Add Current Location as Zone</Text>
        </TouchableOpacity>
      </View>

      {/* Modal: Create Custom Zone (Bug 6) */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Trigger Zone</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Give this craving trigger zone a recognizable name:
            </Text>

            <TextInput
              style={styles.modalInput}
              value={newZoneName}
              onChangeText={setNewZoneName}
              placeholder="e.g. Office Balcony, Corner Pan Shop"
              placeholderTextColor="#666"
            />

            <Text style={[styles.modalSub, { marginTop: 14, marginBottom: 8 }]}>
              Protection Radius:
            </Text>

            <View style={styles.radiusRow}>
              {[50, 100, 200].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.radiusBtn,
                    newZoneRadius === r && styles.radiusBtnActive,
                  ]}
                  onPress={() => setNewZoneRadius(r)}
                >
                  <Text
                    style={[
                      styles.radiusBtnText,
                      newZoneRadius === r && styles.radiusBtnTextActive,
                    ]}
                  >
                    {r} meters
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.confirmSaveBtn}
              onPress={confirmAddZone}
            >
              <Text style={styles.confirmSaveBtnText}>Save Zone</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  statusToggle: {
    padding: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  expoGoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.12)",
    borderColor: "#FFD700",
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  expoGoText: {
    color: "#FFD700",
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  tabSwitcher: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    gap: 10,
  },
  switchTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#161616",
  },
  switchTabActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  switchTabText: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "600",
  },
  switchTabTextActive: {
    color: "#000000",
    fontWeight: "700",
  },
  mapWrapper: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#222222",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  mapHintBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mapHintText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyZonesContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySub: {
    color: "#888888",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  zoneCard: {
    backgroundColor: CARD_BG,
    borderColor: "#1E1E1E",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  zoneIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(57, 255, 20, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  zoneDetails: {
    flex: 1,
  },
  zoneCardName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  zoneCardCoords: {
    color: "#888888",
    fontSize: 11,
  },
  zoneDeleteBtn: {
    padding: 8,
  },
  controls: {
    padding: 16,
    backgroundColor: BG_COLOR,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  btnText: {
    color: "#000000",
    fontWeight: "800",
    fontSize: 15,
  },
  permissionBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  modalSub: {
    color: "#888888",
    fontSize: 13,
  },
  modalInput: {
    backgroundColor: "#1C1C1C",
    color: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginTop: 8,
  },
  radiusRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  radiusBtn: {
    flex: 1,
    backgroundColor: "#1C1C1C",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  radiusBtnActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  radiusBtnText: {
    color: "#888888",
    fontWeight: "700",
    fontSize: 13,
  },
  radiusBtnTextActive: {
    color: "#000000",
  },
  confirmSaveBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmSaveBtnText: {
    color: "#000000",
    fontWeight: "800",
    fontSize: 16,
  },
});

// Dark Map Style JSON
const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];