import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export const GEOFENCING_TASK_NAME = 'GEOFENCING_TASK';

// Configure notifications presentation — only in dev builds (not Expo Go)
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo) {
  // Dynamic import to avoid crash in Expo Go SDK 53+
  import('expo-notifications').then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }).catch((err) => {
    console.log('Notifications handler setup skipped:', err);
  });
}

// Define root-level background geofence task
TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('Geofencing background task error:', error);
    return;
  }
  if (data) {
    const { eventType, region } = data;
    const isEnter = eventType === Location.GeofencingEventType.Enter;
    const eventName = isEnter ? 'Entered' : 'Exited';
    const zoneLabel = region?.identifier || 'Trigger Zone';

    try {
      // Dynamic import to avoid crash in Expo Go
      const Notifications = await import('expo-notifications');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isEnter ? `⚠️ Trigger Zone Alert: ${eventName}` : `✅ Safely Left Zone`,
          body: isEnter
            ? `You have entered ${zoneLabel}! Take 3 deep breaths and remember why you quit.`
            : `You have exited ${zoneLabel}. Great job staying smoke-free!`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch (err) {
      console.log('Notification scheduling skipped (Expo Go):', err);
    }
  }
});
