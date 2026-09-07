import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ──────────────────────────────────────────────────
export type UserType = 'smoker' | 'non-smoker';
export type SubscriptionTier = 'free' | 'premium' | 'elite';
export type QuitStrategy = 'cold_turkey' | 'gradual';
export type FitnessGoal = 'weight_loss' | 'build_strength' | 'athlete' | 'general_wellness';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SmokerProfile {
  cigarettesPerDay: number;
  yearsSmoking: number;
  triggers: string[];
  quitStrategy: QuitStrategy;
  costPerPack: number;
  quitDate: string | null;
  previousAttempts: number;
}

export interface FitnessProfile {
  goal: FitnessGoal;
  level: FitnessLevel;
  sport: string | null;
  workoutDays: string[];
  dietaryPref: string;
}

export interface Achievement {
  id: string;
  unlockedAt: string;
}

export interface UserProfile {
  userType: UserType;
  smokerProfile: SmokerProfile | null;
  fitnessProfile: FitnessProfile | null;
  xp: number;
  level: number;
  achievements: Achievement[];
  healthScore: number;
  subscriptionTier: SubscriptionTier;
}

// ─── Context Shape ──────────────────────────────────────────
interface UserContextType {
  userType: UserType | null;
  profile: UserProfile | null;
  setUserType: (type: UserType) => Promise<void>;
  setProfile: (profile: Partial<UserProfile>) => Promise<void>;
  /** Check if user has a premium or elite subscription */
  isPremium: boolean;
  /** Reset profile (on logout) */
  clearProfile: () => Promise<void>;
  loading: boolean;
}

const defaultProfile: UserProfile = {
  userType: 'smoker',
  smokerProfile: null,
  fitnessProfile: null,
  xp: 0,
  level: 1,
  achievements: [],
  healthScore: 0,
  subscriptionTier: 'free',
};

const UserContext = createContext<UserContextType>({
  userType: null,
  profile: null,
  setUserType: async () => {},
  setProfile: async () => {},
  isPremium: false,
  clearProfile: async () => {},
  loading: true,
});

// ─── Storage Keys ───────────────────────────────────────────
const STORAGE_KEY_USER_TYPE = '@lastpuff_user_type';
const STORAGE_KEY_PROFILE = '@lastpuff_user_profile';

// ─── Provider ───────────────────────────────────────────────
export function UserProvider({ children }: { children: ReactNode }) {
  const [userType, setUserTypeState] = useState<UserType | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [storedType, storedProfile] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_USER_TYPE),
          AsyncStorage.getItem(STORAGE_KEY_PROFILE),
        ]);

        if (storedType === 'smoker' || storedType === 'non-smoker') {
          setUserTypeState(storedType);
        }

        if (storedProfile) {
          try {
            setProfileState(JSON.parse(storedProfile));
          } catch {
            // Corrupted data — ignore
          }
        }
      } catch (err) {
        console.error('UserContext: failed to load stored profile', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setUserType = async (type: UserType) => {
    setUserTypeState(type);
    await AsyncStorage.setItem(STORAGE_KEY_USER_TYPE, type);

    // Initialize profile if not already set
    if (!profile) {
      const newProfile: UserProfile = {
        ...defaultProfile,
        userType: type,
      };
      setProfileState(newProfile);
      await AsyncStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
    } else {
      const updatedProfile = { ...profile, userType: type };
      setProfileState(updatedProfile);
      await AsyncStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updatedProfile));
    }
  };

  const setProfile = async (partial: Partial<UserProfile>) => {
    const merged: UserProfile = {
      ...(profile ?? defaultProfile),
      ...partial,
    };
    setProfileState(merged);
    await AsyncStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(merged));
  };

  const clearProfile = async () => {
    setUserTypeState(null);
    setProfileState(null);
    await AsyncStorage.multiRemove([STORAGE_KEY_USER_TYPE, STORAGE_KEY_PROFILE]);
  };

  const isPremium =
    profile?.subscriptionTier === 'premium' ||
    profile?.subscriptionTier === 'elite';

  return (
    <UserContext.Provider
      value={{
        userType,
        profile,
        setUserType,
        setProfile,
        isPremium,
        clearProfile,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/** Hook to consume the UserContext */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}

export default UserContext;
