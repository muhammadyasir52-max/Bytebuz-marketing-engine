import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';

const COLORS = {
  background: '#0A0A1A',
  primary: '#7C3AED',
  textSecondary: '#A0A0C0',
};

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  style?: ViewStyle;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
  fullScreen = false,
  style,
  color,
}) => {
  const spinnerColor = color || COLORS.primary;

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]}>
        <ActivityIndicator size={size} color={spinnerColor} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inline: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoadingSpinner;
