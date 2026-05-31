import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  label?: string;
  hint?: string;
  style?: ViewStyle;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = 'Type and press space or Enter to add…',
  maxTags,
  label,
  hint,
  style,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isAtMax = maxTags !== undefined && tags.length >= maxTags;

  const addTag = (raw: string) => {
    const trimmed = raw.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setInputValue('');
      return;
    }
    if (isAtMax) return;
    onTagsChange([...tags, trimmed]);
    setInputValue('');
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onTagsChange(newTags);
  };

  const handleChangeText = (text: string) => {
    // Trigger on space
    if (text.endsWith(' ') || text.endsWith(',')) {
      addTag(text.slice(0, -1));
    } else {
      setInputValue(text);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleSubmit = () => {
    addTag(inputValue);
  };

  const containerBorder = isFocused ? COLORS.primary : COLORS.border;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.inputContainer, { borderColor: containerBorder }]}
        onPress={() => inputRef.current?.focus()}
        activeOpacity={1}
      >
        <ScrollView
          horizontal={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.tagsArea}
        >
          {/* Existing tags */}
          {tags.map((tag, index) => (
            <View key={`${tag}-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
              <TouchableOpacity
                onPress={() => removeTag(index)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={styles.removeButton}
              >
                <Ionicons name="close" size={12} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Text input */}
          {!isAtMax && (
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={inputValue}
              onChangeText={handleChangeText}
              onKeyPress={handleKeyPress}
              onSubmitEditing={handleSubmit}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                if (inputValue.trim()) addTag(inputValue);
              }}
              placeholder={tags.length === 0 ? placeholder : 'Add more…'}
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="done"
              blurOnSubmit={false}
              selectionColor={COLORS.primary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
        </ScrollView>
      </TouchableOpacity>

      {/* Footer row */}
      <View style={styles.footer}>
        {hint ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : (
          <Text style={styles.hint}>Press space or Enter to add a tag</Text>
        )}
        {maxTags !== undefined && (
          <Text
            style={[
              styles.counter,
              isAtMax && styles.counterAtMax,
            ]}
          >
            {tags.length}/{maxTags}
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
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 52,
    maxHeight: 140,
  },
  tagsArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 8,
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}22`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}50`,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    fontSize: 14,
    color: COLORS.textPrimary,
    minWidth: 100,
    paddingVertical: 4,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
  counter: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 8,
    fontWeight: '600',
  },
  counterAtMax: {
    color: COLORS.error,
  },
});

export default TagInput;
