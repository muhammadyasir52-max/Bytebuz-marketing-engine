import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

const COLORS = {
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
};

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  style?: TextStyle;
  containerStyle?: ViewStyle;
}

const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  isStreaming,
  style,
  containerStyle,
}) => {
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const blinkAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isStreaming) {
      blinkAnimation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 530,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 530,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.current.start();
    } else {
      blinkAnimation.current?.stop();
      // Fade cursor out when streaming stops
      Animated.timing(cursorOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      blinkAnimation.current?.stop();
    };
  }, [isStreaming]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.text, style]}>
        {text}
        {isStreaming && (
          <Animated.Text
            style={[styles.cursor, { opacity: cursorOpacity }]}
          >
            {'|'}
          </Animated.Text>
        )}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
  },
  text: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  cursor: {
    color: COLORS.primary,
    fontWeight: '300',
    fontSize: 15,
  },
});

export default StreamingText;
