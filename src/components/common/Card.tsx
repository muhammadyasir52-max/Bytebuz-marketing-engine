import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';

const COLORS = {
  card: '#1C1C35',
  border: '#2A2A45',
};

type PaddingSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: PaddingSize;
  elevated?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = 'md',
  elevated = false,
}) => {
  const containerStyle: ViewStyle[] = [
    styles.card,
    styles[`padding_${padding}`],
    elevated ? styles.elevated : {},
    style || {},
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  padding_sm: {
    padding: 12,
  },
  padding_md: {
    padding: 16,
  },
  padding_lg: {
    padding: 24,
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default Card;
