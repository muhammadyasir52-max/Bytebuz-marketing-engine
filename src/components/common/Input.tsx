import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';

const COLORS = {
  surface: '#141428',
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  error: '#EF4444',
};

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  maxLength?: number;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  editable?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  maxLength,
  error,
  hint,
  leftIcon,
  rightIcon,
  editable = true,
  style,
  inputStyle,
  numberOfLines = 1,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
  onBlur,
  onFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? COLORS.error : COLORS.border,
      error ? COLORS.error : COLORS.primary,
    ],
  });

  const charCount = value.length;
  const isNearLimit = maxLength ? charCount >= maxLength * 0.9 : false;
  const isAtLimit = maxLength ? charCount >= maxLength : false;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputContainer,
          multiline && styles.inputContainerMultiline,
          !editable && styles.inputContainerDisabled,
          { borderColor },
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            leftIcon ? styles.inputWithLeftIcon : {},
            rightIcon ? styles.inputWithRightIcon : {},
            !editable && styles.inputDisabled,
            inputStyle || {},
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          editable={editable}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={COLORS.primary}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : hint ? (
            <Text style={styles.hintText}>{hint}</Text>
          ) : null}
        </View>
        {maxLength && (
          <Text
            style={[
              styles.charCount,
              isAtLimit ? styles.charCountError : isNearLimit ? styles.charCountWarning : {},
            ]}
          >
            {charCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 50,
    overflow: 'hidden',
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputMultiline: {
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  inputDisabled: {
    color: COLORS.textMuted,
  },
  leftIconContainer: {
    paddingLeft: 14,
    paddingRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: 14,
    paddingLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  footerLeft: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  charCountWarning: {
    color: '#F59E0B',
  },
  charCountError: {
    color: COLORS.error,
  },
});

export default Input;
