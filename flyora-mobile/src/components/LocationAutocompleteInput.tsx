import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ALL_INDIA_LOCATIONS, IndianLocation } from '../data/indianLocations';
import { apiFetch } from '../services/api';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const LocationAutocompleteInput: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Type city, area or pincode (e.g. Idar, 383430, Surat)...',
  label,
  iconName = 'location-outline',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [liveLocations, setLiveLocations] = useState<any[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Live Geocoding API Query to connected Backend (/api/locations/search/?q=...)
  useEffect(() => {
    const trimmed = (inputValue || '').trim();
    if (trimmed.length < 2) {
      setLiveLocations([]);
      setLoadingLive(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setLoadingLive(true);
      try {
        const res = await apiFetch(`/api/locations/search/?q=${encodeURIComponent(trimmed)}`);
        if (res.success && Array.isArray(res.data)) {
          setLiveLocations(res.data);
        } else {
          setLiveLocations([]);
        }
      } catch {
        setLiveLocations([]);
      } finally {
        setLoadingLive(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [inputValue]);

  // Merged suggestions: Backend Live results first + Local Indian dataset
  const combinedSuggestions = React.useMemo(() => {
    const trimmed = (inputValue || '').trim().toLowerCase();
    const seen = new Set<string>();
    const merged: any[] = [];

    // 1. Add Live Backend Geocoding & Pincode Results First
    for (const item of liveLocations) {
      const key = (item.formatted || item.name || '').toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({
          id: item.id || `live-${key}`,
          name: item.name || item.city,
          secondary: item.secondary || `${item.state || 'India'} ${item.pincode ? '· ' + item.pincode : ''}`,
          formatted: item.formatted,
          isLive: true,
          type: item.type,
        });
      }
    }

    // 2. Add Local Dataset Matches
    if (trimmed.length > 0) {
      const localMatches = ALL_INDIA_LOCATIONS.filter((loc) => {
        const matchesName = loc.name.toLowerCase().includes(trimmed);
        const matchesCity = loc.city.toLowerCase().includes(trimmed);
        const matchesState = loc.state.toLowerCase().includes(trimmed);
        const matchesCode = loc.code ? loc.code.toLowerCase().includes(trimmed) : false;
        const matchesAlias = loc.aliases?.some((a) => a.toLowerCase().includes(trimmed));
        return matchesName || matchesCity || matchesState || matchesCode || matchesAlias;
      });

      for (const loc of localMatches) {
        const formatted = loc.code ? `${loc.city} (${loc.code})` : `${loc.name}, ${loc.state}`;
        const key = formatted.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push({
            id: `loc-${loc.name}`,
            name: loc.name,
            secondary: loc.code ? `Airport (${loc.code}) · ${loc.state}` : `${loc.state}, India`,
            formatted,
            isLive: false,
            code: loc.code,
            type: loc.type,
          });
        }
      }
    } else {
      // Default Transit Hubs if empty
      const defaultHubs = ALL_INDIA_LOCATIONS.filter((l) =>
        ['AMD', 'STV', 'BOM', 'DEL', 'BLR', 'PNQ'].includes(l.code || '')
      ).slice(0, 6);

      for (const loc of defaultHubs) {
        const formatted = `${loc.city} (${loc.code})`;
        merged.push({
          id: `hub-${loc.name}`,
          name: loc.name,
          secondary: `Transit Hub (${loc.code}) · ${loc.state}`,
          formatted,
          isLive: false,
          code: loc.code,
          type: 'airport',
        });
      }
    }

    return merged.slice(0, 10);
  }, [liveLocations, inputValue]);

  const handleSelect = (item: any) => {
    const chosen = item.formatted || item.name;
    setInputValue(chosen);
    onChange(chosen);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputBox, isOpen && styles.inputBoxFocused]}>
        <Ionicons name={iconName} size={18} color="#089A8D" style={styles.icon} />
        <TextInput
          style={styles.textInput}
          value={inputValue}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          onFocus={() => setIsOpen(true)}
          onChangeText={(text) => {
            setInputValue(text);
            onChange(text);
            if (!isOpen) setIsOpen(true);
          }}
        />

        {loadingLive && (
          <ActivityIndicator size="small" color="#089A8D" style={{ marginRight: 6 }} />
        )}

        {inputValue.length > 0 ? (
          <TouchableOpacity
            onPress={() => {
              setInputValue('');
              onChange('');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={17} color="#94A3B8" />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-down" size={16} color="#94A3B8" />
        )}
      </View>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownHeader}>
            <Ionicons name="location" size={12} color="#089A8D" />
            <Text style={styles.dropdownHeaderText}>
              {loadingLive ? 'SEARCHING ALL INDIA LOCATIONS...' : 'ALL INDIA LIVE LOCATIONS & PINCODES'}
            </Text>
          </View>
          <ScrollView
            style={styles.dropdownScroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {combinedSuggestions.map((item, idx) => (
              <TouchableOpacity
                key={`${item.id}-${idx}`}
                style={styles.suggestionRow}
                activeOpacity={0.7}
                onPress={() => handleSelect(item)}
              >
                <View
                  style={[
                    styles.suggestionIconBox,
                    item.isLive && styles.suggestionIconBoxLive,
                  ]}
                >
                  <Ionicons
                    name={
                      item.type === 'pincode'
                        ? 'mail-outline'
                        : item.code || item.type === 'airport'
                        ? 'airplane'
                        : 'location-outline'
                    }
                    size={14}
                    color="#089A8D"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionName} numberOfLines={1}>
                    {item.formatted || item.name}
                  </Text>
                  <Text style={styles.suggestionSub} numberOfLines={1}>
                    {item.secondary}
                  </Text>
                </View>
                {inputValue.toLowerCase() === (item.formatted || '').toLowerCase() && (
                  <Ionicons name="checkmark-circle" size={16} color="#089A8D" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputBoxFocused: {
    borderColor: '#089A8D',
    backgroundColor: '#F0FDFA',
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  dropdownContainer: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    maxHeight: 250,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  suggestionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E6FAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  suggestionIconBoxLive: {
    backgroundColor: '#CCFBF1',
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  suggestionSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
});
