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
  card: '#1C1C35',
  border: '#2A2A45',
  primary: '#7C3AED',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  surface: '#141428',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type ViewMode = 'week' | 'month';

interface CalendarHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  style?: ViewStyle;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  style,
}) => {
  const month = MONTH_NAMES[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();

  const navigatePrev = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
      newDate.setDate(1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    onDateChange(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
      newDate.setDate(1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isCurrentMonth =
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();

  return (
    <View style={[styles.container, style]}>
      {/* Month/Year + navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={navigatePrev}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday} activeOpacity={0.8}>
          <Text style={styles.monthYear}>
            {month} {year}
          </Text>
          {!isCurrentMonth && (
            <Text style={styles.todayHint}>Tap to go to today</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={navigateNext}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* View mode toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            viewMode === 'week' && styles.toggleOptionActive,
          ]}
          onPress={() => onViewModeChange('week')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'week' && styles.toggleTextActive,
            ]}
          >
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            viewMode === 'month' && styles.toggleOptionActive,
          ]}
          onPress={() => onViewModeChange('month')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'month' && styles.toggleTextActive,
            ]}
          >
            Month
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  todayHint: {
    fontSize: 10,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  toggleOption: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  toggleOptionActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
});

export default CalendarHeader;
