import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';

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
  error: '#EF4444',
};

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth ? styles.fullWidth : {},
    isDisabled ? styles.disabled : {},
    style || {},
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`textSize_${size}`],
    styles[`textVariant_${variant}`],
    isDisabled ? styles.textDisabled : {},
  ];

  const spinnerColor =
    variant === 'outline' || variant === 'ghost'
      ? COLORS.primary
      : COLORS.textPrimary;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], alignSelf: fullWidth ? 'stretch' : 'auto' }}>
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={spinnerColor}
            style={styles.spinner}
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={textStyle}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 0,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  spinner: {
    marginHorizontal: 4,
  },
  iconContainer: {
    marginRight: 8,
  },

  // Sizes
  size_sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  size_md: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  size_lg: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
  },

  // Variants
  variant_primary: {
    backgroundColor: COLORS.primary,
  },
  variant_secondary: {
    backgroundColor: COLORS.secondary,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: COLORS.error,
  },

  // Text base
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Text sizes
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 17,
  },

  // Text variants
  textVariant_primary: {
    color: COLORS.textPrimary,
  },
  textVariant_secondary: {
    color: COLORS.textPrimary,
  },
  textVariant_outline: {
    color: COLORS.primary,
  },
  textVariant_ghost: {
    color: COLORS.primary,
  },
  textVariant_danger: {
    color: COLORS.textPrimary,
  },

  textDisabled: {
    opacity: 0.7,
  },
});

export default Button;
