import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../context/AuthContext';
import { updateProfile } from '../services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [heightCm, setHeightCm] = useState(user?.heightCm ? String(user.heightCm) : '');
  const [weightKg, setWeightKg] = useState(user?.weightKg ? String(user.weightKg) : '');
  const [plan, setPlan] = useState<'gradual' | 'aggressive'>(
    user?.plan === 'aggressive' ? 'aggressive' : 'gradual'
  );
  const [cigarettesPerDay, setCigarettesPerDay] = useState(
    user?.cigarettesPerDay ? String(user.cigarettesPerDay) : '10'
  );
  const [pricePerPack, setPricePerPack] = useState(
    user?.pricePerPack ? String(user.pricePerPack) : '200'
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Name is required',
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        age: age ? Number(age) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        plan,
        cigarettesPerDay: cigarettesPerDay ? Number(cigarettesPerDay) : undefined,
        pricePerPack: pricePerPack ? Number(pricePerPack) : undefined,
      };

      const res = await updateProfile(payload);
      if (res?.data?.user) {
        await updateUser(res.data.user);
      } else {
        await updateUser(payload);
      }

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}

      Toast.show({
        type: 'success',
        text1: 'Profile updated ✅',
        text2: 'Your health targets have been updated.',
      });

      router.back();
    } catch (err: any) {
      console.error('Profile update error:', err);
      // Still update local context optimistically
      await updateUser({
        name: name.trim(),
        age: age ? Number(age) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        plan,
      });
      Toast.show({
        type: 'success',
        text1: 'Profile updated ✅',
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#39FF14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveHeaderBtn}>
          <Text style={styles.saveHeaderText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 25"
              placeholderTextColor="#666"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={heightCm}
              onChangeText={setHeightCm}
              placeholder="e.g. 175"
              placeholderTextColor="#666"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="e.g. 70"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Smoking & Habit Stats */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cigarettes Per Day</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={cigarettesPerDay}
            onChangeText={setCigarettesPerDay}
            placeholder="e.g. 10"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Average Pack Price (₹)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={pricePerPack}
            onChangeText={setPricePerPack}
            placeholder="e.g. 200"
            placeholderTextColor="#666"
          />
        </View>

        {/* Cessation Plan */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cessation Plan Strategy</Text>
          <View style={styles.planSelector}>
            <TouchableOpacity
              style={[styles.planBtn, plan === 'gradual' && styles.planBtnActive]}
              onPress={() => setPlan('gradual')}
            >
              <Ionicons
                name="trending-down-outline"
                size={20}
                color={plan === 'gradual' ? '#000000' : '#888888'}
              />
              <Text
                style={[
                  styles.planBtnText,
                  plan === 'gradual' && styles.planBtnTextActive,
                ]}
              >
                Gradual (30 Days)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planBtn,
                plan === 'aggressive' && styles.planBtnActive,
              ]}
              onPress={() => setPlan('aggressive')}
            >
              <Ionicons
                name="flame"
                size={20}
                color={plan === 'aggressive' ? '#000000' : '#888888'}
              />
              <Text
                style={[
                  styles.planBtnText,
                  plan === 'aggressive' && styles.planBtnTextActive,
                ]}
              >
                Cold Turkey
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bottomSaveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.bottomSaveBtnText}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  saveHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#39FF14',
    borderRadius: 8,
  },
  saveHeaderText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#121212',
    borderColor: '#262626',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  planSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  planBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#161616',
    borderColor: '#262626',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
  },
  planBtnActive: {
    backgroundColor: '#39FF14',
    borderColor: '#39FF14',
  },
  planBtnText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '700',
  },
  planBtnTextActive: {
    color: '#000000',
  },
  bottomSaveBtn: {
    backgroundColor: '#39FF14',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#39FF14',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  bottomSaveBtnText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
