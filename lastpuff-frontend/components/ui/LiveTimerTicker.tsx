import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

interface LiveTimerTickerProps {
  startDate?: string | Date;
  cigsPerDay?: number;
  costPerPack?: number; // default ₹360 for 20 cigs = ₹18/cig
}

export default function LiveTimerTicker({
  startDate,
  cigsPerDay = 12,
  costPerPack = 360,
}: LiveTimerTickerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Default start date = 2 days, 14 hours ago if none specified
    const initialTime = startDate
      ? new Date(startDate).getTime()
      : Date.now() - (2 * 24 * 3600 + 14 * 3600 + 32 * 60) * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - initialTime) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  const days = Math.floor(elapsedSeconds / 86400);
  const hours = Math.floor((elapsedSeconds % 86400) / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  // Rupee calculations: cigs per second = cigsPerDay / 86400. Cost per cig = costPerPack / 20
  const costPerCig = costPerPack / 20;
  const moneySaved = (elapsedSeconds * (cigsPerDay / 86400) * costPerCig).toFixed(2);
  const cigsAvoided = Math.floor(elapsedSeconds * (cigsPerDay / 86400));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Top Header Badge */}
        <View style={styles.topRow}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>SMOKE-FREE MOMENTUM</Text>
          </View>
          <View style={styles.savingsPill}>
            <Ionicons name="wallet" size={13} color={COLORS.primary} />
            <Text style={styles.savingsText}>₹{moneySaved} SAVED</Text>
          </View>
        </View>

        {/* Live Digital Clock Units */}
        <View style={styles.timerRow}>
          <View style={styles.unitBox}>
            <Text style={styles.unitNum}>{String(days).padStart(2, '0')}</Text>
            <Text style={styles.unitLabel}>DAYS</Text>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.unitBox}>
            <Text style={styles.unitNum}>{String(hours).padStart(2, '0')}</Text>
            <Text style={styles.unitLabel}>HOURS</Text>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.unitBox}>
            <Text style={styles.unitNum}>{String(minutes).padStart(2, '0')}</Text>
            <Text style={styles.unitLabel}>MINS</Text>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.unitBox}>
            <Text style={[styles.unitNum, { color: COLORS.primary }]}>
              {String(seconds).padStart(2, '0')}
            </Text>
            <Text style={styles.unitLabel}>SECS</Text>
          </View>
        </View>

        {/* Bottom Metrics Bar */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{cigsAvoided}</Text>
            <Text style={styles.metricSub}>Cigarettes Avoided</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricVal, { color: COLORS.primary }]}>+{(cigsAvoided * 11).toFixed(0)}m</Text>
            <Text style={styles.metricSub}>Life Regained</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricVal, { color: COLORS.accent }]}>98.4%</Text>
            <Text style={styles.metricSub}>CO Expelled</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.md,
    shadowColor: '#00F5A0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardGradient: {
    padding: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  liveText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 245, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 160, 0.3)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  savingsText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
    gap: 4,
  },
  unitBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: 2,
    borderRadius: RADIUS.md,
    minWidth: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  unitNum: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  unitLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  colon: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 10,
    width: 8,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm + 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  metricSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
