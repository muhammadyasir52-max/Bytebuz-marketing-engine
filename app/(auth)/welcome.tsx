import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#0A0A1A',
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  secondary: '#3B82F6',
  accent: '#10B981',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
};

export default function WelcomeScreen() {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;
  const socialProofAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.stagger(150, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(titleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(taglineAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(descAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(ctaAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(socialProofAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]);
    sequence.start();
  }, []);

  const makeAnimStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  });

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoAnim,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Text style={styles.logoLetter}>B</Text>
            </View>
          </View>
          <View style={styles.logoGlow} />
        </Animated.View>

        {/* App name */}
        <Animated.View style={makeAnimStyle(titleAnim)}>
          <Text style={styles.appName}>Bytebuz</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={makeAnimStyle(taglineAnim)}>
          <Text style={styles.tagline}>Your AI Marketing Engine</Text>
        </Animated.View>

        {/* Description */}
        <Animated.View style={[makeAnimStyle(descAnim), styles.descContainer]}>
          <Text style={styles.description}>
            Transform your business with AI-powered content that resonates, converts, and grows your audience across every platform.
          </Text>
        </Animated.View>

        {/* Feature pills */}
        <Animated.View style={[makeAnimStyle(descAnim), styles.pillsRow]}>
          {['AI Content', 'Multi-Platform', 'Analytics'].map((pill) => (
            <View key={pill} style={styles.pill}>
              <Text style={styles.pillText}>{pill}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Bottom CTA */}
      <Animated.View style={[styles.bottomSection, makeAnimStyle(ctaAnim)]}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(auth)/onboarding/step1')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Get Started</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </TouchableOpacity>

        <Animated.View style={makeAnimStyle(socialProofAnim)}>
          <Text style={styles.socialProof}>Join thousands of entrepreneurs growing with AI</Text>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 44,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
    opacity: 0.12,
    zIndex: -1,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  descContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  pillText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 16,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  ctaArrow: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  socialProof: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
