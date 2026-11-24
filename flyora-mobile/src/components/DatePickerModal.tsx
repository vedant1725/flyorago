import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlyoraColors, Shadows } from '../constants/theme';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
  selectedDate?: string;
  minDate?: string; // e.g. '2026-11-20'
  title?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  minDate,
  title = 'Select Date',
}) => {
  // Parse initial date
  const parseDate = (dStr?: string) => {
    if (dStr && /^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const initial = parseDate(selectedDate);
  const [currentYear, setCurrentYear] = useState<number>(initial.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initial.getMonth());
  const [activeDateStr, setActiveDateStr] = useState<string>(selectedDate || '');

  // Format helper YYYY-MM-DD
  const formatYYYYMMDD = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Calendar math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Generate calendar grid
  const calendarCells = [];
  // blanks for preceding days
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ key: `blank-${i}`, isBlank: true });
  }
  // days of current month
  const todayStr = formatYYYYMMDD(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const minLimitStr = minDate || todayStr;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatYYYYMMDD(currentYear, currentMonth, day);
    const isPast = dateStr < minLimitStr;
    const isSelected = dateStr === activeDateStr;
    const isToday = dateStr === todayStr;

    calendarCells.push({
      key: `day-${day}`,
      day,
      dateStr,
      isPast,
      isSelected,
      isToday,
      isBlank: false,
    });
  }

  const handleDayPress = (cell: any) => {
    if (cell.isBlank || cell.isPast) return;
    setActiveDateStr(cell.dateStr);
  };

  const handleConfirm = () => {
    if (activeDateStr) {
      onSelectDate(activeDateStr);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.selectedDisplay}>
                {activeDateStr || 'Choose a travel / delivery date'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Month / Year Navigator */}
          <View style={styles.navRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowBtn}>
              <Ionicons name="chevron-back" size={20} color="#089A8D" />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.arrowBtn}>
              <Ionicons name="chevron-forward" size={20} color="#089A8D" />
            </TouchableOpacity>
          </View>

          {/* Day of Week Headers */}
          <View style={styles.daysHeaderRow}>
            {DAYS_SHORT.map((d, idx) => (
              <Text
                key={idx}
                style={[
                  styles.dayOfWeekText,
                  (idx === 0 || idx === 6) && { color: '#089A8D' },
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.grid}>
            {calendarCells.map((cell) => {
              if (cell.isBlank) {
                return <View key={cell.key} style={styles.cell} />;
              }

              return (
                <TouchableOpacity
                  key={cell.key}
                  style={[
                    styles.cell,
                    cell.isSelected && styles.cellSelected,
                    cell.isToday && !cell.isSelected && styles.cellToday,
                  ]}
                  onPress={() => handleDayPress(cell)}
                  disabled={cell.isPast}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cellText,
                      cell.isPast && styles.cellTextPast,
                      cell.isSelected && styles.cellTextSelected,
                      cell.isToday && !cell.isSelected && styles.cellTextToday,
                    ]}
                  >
                    {cell.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Preset Buttons (Today, Tomorrow, In 1 Week) */}
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={styles.presetPill}
              onPress={() => {
                const now = new Date();
                const str = formatYYYYMMDD(now.getFullYear(), now.getMonth(), now.getDate());
                setActiveDateStr(str);
                setCurrentYear(now.getFullYear());
                setCurrentMonth(now.getMonth());
              }}
            >
              <Text style={styles.presetText}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetPill}
              onPress={() => {
                const tm = new Date();
                tm.setDate(tm.getDate() + 1);
                const str = formatYYYYMMDD(tm.getFullYear(), tm.getMonth(), tm.getDate());
                setActiveDateStr(str);
                setCurrentYear(tm.getFullYear());
                setCurrentMonth(tm.getMonth());
              }}
            >
              <Text style={styles.presetText}>Tomorrow</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetPill}
              onPress={() => {
                const wk = new Date();
                wk.setDate(wk.getDate() + 7);
                const str = formatYYYYMMDD(wk.getFullYear(), wk.getMonth(), wk.getDate());
                setActiveDateStr(str);
                setCurrentYear(wk.getFullYear());
                setCurrentMonth(wk.getMonth());
              }}
            >
              <Text style={styles.presetText}>+7 Days</Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmBtn, !activeDateStr && { opacity: 0.5 }]}
            onPress={handleConfirm}
            disabled={!activeDateStr}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>Confirm Date</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    ...Shadows.cardHover,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  selectedDisplay: {
    fontSize: 12,
    color: '#089A8D',
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  daysHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  dayOfWeekText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  cell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 12,
  },
  cellSelected: {
    backgroundColor: '#089A8D',
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: '#089A8D',
  },
  cellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  cellTextPast: {
    color: '#CBD5E1',
    textDecorationLine: 'line-through',
  },
  cellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  cellTextToday: {
    color: '#089A8D',
    fontWeight: '800',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  presetPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#089A8D',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 12,
    gap: 6,
    ...Shadows.sm,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
