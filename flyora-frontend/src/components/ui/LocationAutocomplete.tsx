import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plane, Building2, Map, X, Check, Loader2, Navigation } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { 
  searchLocalIndianLocations, 
  IndianLocation, 
  ALL_INDIA_LOCATIONS 
} from '../../data/indianLocations';

interface LocationAutocompleteProps {
  name?: string;
  value: string;
  onChange: (value: string, location?: any) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  id?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  name,
  value,
  onChange,
  placeholder = 'Type exact city, area, town, or pincode (e.g. Bopal, Varachha, 380015)...',
  required = false,
  disabled = false,
  className = '',
  label,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [liveSuggestions, setLiveSuggestions] = useState<any[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<any>(null);

  // Fast local matches
  const localSuggestions = React.useMemo(() => {
    const trimmed = (value || '').trim();
    if (trimmed.length > 0) {
      return searchLocalIndianLocations(trimmed, 6).map(loc => ({
        id: `loc-${loc.name}-${loc.state}`,
        name: loc.name,
        secondary: loc.code ? `Airport (${loc.code}) · ${loc.state}` : `${loc.state}, India`,
        formatted: loc.code ? `${loc.city} (${loc.code})` : `${loc.name}, ${loc.state}`,
        city: loc.city,
        state: loc.state,
        type: loc.type
      }));
    }
    // Top transit hubs across India when clicking an empty field
    return ALL_INDIA_LOCATIONS.filter(l => 
      ['AMD', 'BOM', 'DEL', 'BLR', 'STV', 'HYD', 'PNQ', 'JAI', 'GOI'].includes(l.code || '')
    ).slice(0, 6).map(loc => ({
      id: `hub-${loc.city}`,
      name: loc.city,
      secondary: `Transit Hub (${loc.code}) · ${loc.state}`,
      formatted: `${loc.city} (${loc.code})`,
      city: loc.city,
      state: loc.state,
      type: 'airport'
    }));
  }, [value]);

  // Live Geocoding API Query across all of India (localities, areas, streets, towns, pin codes)
  useEffect(() => {
    const trimmed = (value || '').trim();
    if (trimmed.length < 2) {
      setLiveSuggestions([]);
      setIsLoadingLive(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingLive(true);
      try {
        const res = await apiFetch(`/api/locations/search/?q=${encodeURIComponent(trimmed)}`);
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          setLiveSuggestions(res.data);
        } else {
          setLiveSuggestions([]);
        }
      } catch (err) {
        setLiveSuggestions([]);
      } finally {
        setIsLoadingLive(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // Merge local & exact live locations
  const combinedSuggestions = React.useMemo(() => {
    const seen = new Set<string>();
    const merged: any[] = [];

    // Add exact live results first (they have exact street/area/locality/pincode)
    for (const item of liveSuggestions) {
      const key = (item.formatted || item.name || '').toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }

    // Add local dataset results
    for (const item of localSuggestions) {
      const key = (item.formatted || item.name || '').toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }

    return merged.slice(0, 10);
  }, [liveSuggestions, localSuggestions]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: any) => {
    const chosenValue = loc.formatted || loc.name || '';
    onChange(chosenValue, loc);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(prev => (prev < combinedSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => (prev > 0 ? prev - 1 : combinedSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (isOpen && highlightIndex >= 0 && highlightIndex < combinedSuggestions.length) {
        e.preventDefault();
        handleSelect(combinedSuggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const renderTypeIcon = (type: string, isAirport: boolean) => {
    if (isAirport) {
      return (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-teal-100 text-teal-800">
          <Plane size={15} className="stroke-[2.2]" />
        </div>
      );
    }
    if (type === 'city' || type === 'administrative') {
      return (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
          <Building2 size={15} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-700">
        <MapPin size={15} />
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Leading Pin / Plane icon */}
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
          {value.includes('(') ? (
            <Plane size={15} className="text-teal-600" />
          ) : (
            <MapPin size={15} className="text-slate-400" />
          )}
        </div>

        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-800 ${className}`}
        />

        {/* Clear or Loading Icon */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoadingLive && (
            <Loader2 size={14} className="text-teal-500 animate-spin" />
          )}
          {value && !disabled && (
            <button
              type="button"
              onClick={clearValue}
              className="p-1 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear location"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Google Places Style Suggestions Dropdown */}
      {isOpen && !disabled && combinedSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-[100] max-h-80 overflow-y-auto scrollbar-thin divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2 bg-slate-50/90 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Navigation size={12} className="text-teal-600" />
              {value ? 'Exact Locations Across India' : 'Popular Transit Hubs'}
            </span>
            <span className="text-teal-600 font-bold">{combinedSuggestions.length} found</span>
          </div>

          {combinedSuggestions.map((loc, idx) => {
            const isHighlighted = idx === highlightIndex;
            const isAirport = loc.type === 'airport' || Boolean(loc.secondary && loc.secondary.includes('Airport'));

            return (
              <button
                key={loc.id || `${loc.name}-${idx}`}
                type="button"
                onClick={() => handleSelect(loc)}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 transition-colors ${
                  isHighlighted ? 'bg-teal-50/90 text-teal-950' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                {/* Category Icon */}
                {renderTypeIcon(loc.type, isAirport)}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {loc.name}
                    </span>
                    {loc.pincode && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[9px] font-bold border border-slate-200">
                        {loc.pincode}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {loc.secondary || loc.formatted}
                  </div>
                </div>

                {/* Selected Indicator */}
                {value.toLowerCase().includes(loc.name.toLowerCase()) && (
                  <Check size={14} className="text-teal-600 shrink-0 self-center" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
