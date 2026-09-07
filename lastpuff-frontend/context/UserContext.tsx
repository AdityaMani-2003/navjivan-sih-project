import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext, UserType } from './AuthContext';
import { getProfile } from '../services/api';

export { UserType };
export type SubscriptionTier = 'free' | 'premium' | 'elite';
export type FitnessGoal = string;
export type FitnessLevel = string;
export type QuitStrategy = string;

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  userType: UserType | null;
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  subscriptionTier: SubscriptionTier;
  xp: number;
  level: number;
  streak: number;
  longestStreak?: number;
  achievements: Array<{ id: string; unlockedAt: string }>;
  daysSmokeFree?: number;
  moneySaved?: number;
  cigsAvoided?: number;
  hoursLifeGained?: number;
  activePlan?: any;
  fitnessProfile?: any;
  smokerProfile?: any;
  healthScore?: number;
  [key: string]: any;
}

interface UserContextType {
  profile: UserProfile | null;
  userType: UserType | null;
  xp: number;
  level: number;
  streak: number;
  subscriptionTier: SubscriptionTier;
  achievements: Array<{ id: string; unlockedAt: string }>;
  refreshProfile: () => Promise<void>;
  addXP: (amount: number, reason?: string) => void;
  setUserType: (type: UserType) => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
}

const defaultProfile: UserProfile = {
  _id: '',
  name: 'User',
  email: '',
  userType: null,
  subscriptionTier: 'free',
  xp: 0,
  level: 1,
  streak: 0,
  achievements: [],
  daysSmokeFree: 0,
  moneySaved: 0,
  cigsAvoided: 0,
  hoursLifeGained: 0,
};

export const UserContext = createContext<UserContextType>({
  profile: null,
  userType: null,
  xp: 0,
  level: 1,
  streak: 0,
  subscriptionTier: 'free',
  achievements: [],
  refreshProfile: async () => {},
  addXP: () => {},
  setUserType: async () => {},
  setProfile: () => {},
  loading: false,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshProfile = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await getProfile();
      if (res.data?.success && res.data?.data) {
        const p = res.data.data;
        setProfile((prev) => ({
          ...(prev || defaultProfile),
          ...p,
        }));
        await AsyncStorage.setItem('navjivan_user_profile', JSON.stringify(p));
      }
    } catch {
      // Offline fallback: load from storage
      const cached = await AsyncStorage.getItem('navjivan_user_profile');
      if (cached) {
        try {
          setProfile(JSON.parse(cached));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...(prev || defaultProfile),
        _id: user._id || '',
        name: user.name || 'User',
        email: user.email || '',
        userType: (user.userType as UserType) || null,
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
        subscriptionTier: user.subscriptionTier || 'free',
        fitnessProfile: user.fitnessProfile,
        smokerProfile: user.smokerProfile,
      }));
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [user, isAuthenticated]);

  const addXP = (amount: number) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const newXP = (prev.xp || 0) + amount;
      const newLevel =
        newXP >= 7500
          ? 5
          : newXP >= 3500
          ? 4
          : newXP >= 1500
          ? 3
          : newXP >= 500
          ? 2
          : 1;
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  };

  const setUserType = async (type: UserType) => {
    setProfile((prev) => (prev ? { ...prev, userType: type } : null));
    await AsyncStorage.setItem('navjivan_user_type', type);
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        userType: profile?.userType ?? (user?.userType as UserType) ?? null,
        xp: profile?.xp ?? user?.xp ?? 0,
        level: profile?.level ?? user?.level ?? 1,
        streak: profile?.streak ?? user?.streak ?? 0,
        subscriptionTier: profile?.subscriptionTier ?? 'free',
        achievements: profile?.achievements ?? [],
        refreshProfile,
        addXP,
        setUserType,
        setProfile,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export default UserContext;
