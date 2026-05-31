import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  border: '#2A2A45',
  background: '#0A0A1A',
};

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  style?: ViewStyle;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onSkip,
  showSkip = false,
  style,
}) => {
  const canGoBack = currentStep > 1;

  return (
    <View style={[styles.container, style]}>
      {/* Back button */}
      <TouchableOpacity
        style={[styles.sideButton, !canGoBack && styles.sideButtonHidden]}
        onPress={onBack}
        disabled={!canGoBack}
        activeOpacity={0.7}
      >
        {canGoBack ? (
          <>
            <Ionicons name="chevron-back" size={18} color={COLORS.textSecondary} />
            <Text style={styles.backText}>Back</Text>
          </>
        ) : (
          <View style={styles.placeholder} />
        )}
      </TouchableOpacity>

      {/* Step dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <View
              key={stepNum}
              style={[
                styles.dot,
                isCompleted && styles.dotCompleted,
                isActive && styles.dotActive,
              ]}
            >
              {isCompleted && (
                <Ionicons name="checkmark" size={8} color="#FFFFFF" />
              )}
              {isActive && (
                <View style={styles.activePulse} />
              )}
            </View>
          );
        })}
      </View>

      {/* Skip button */}
      <TouchableOpacity
        style={[styles.sideButton, (!showSkip || !onSkip) && styles.sideButtonHidden]}
        onPress={onSkip}
        disabled={!showSkip || !onSkip}
        activeOpacity={0.7}
      >
        {showSkip && onSkip ? (
          <Text style={styles.skipText}>Skip</Text>
        ) : (
          <View style={styles.placeholder} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  sideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    gap: 2,
  },
  sideButtonHidden: {
    opacity: 0,
  },
  backText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  skipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'right',
    width: '100%',
  },
  placeholder: {
    width: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCompleted: {
    backgroundColor: COLORS.primary,
    width: 10,
    height: 10,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: `${COLORS.primary}50`,
  },
  activePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});

export default OnboardingProgress;
