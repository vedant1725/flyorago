import React, { useEffect, useState, useRef } from 'react';
import { SunMedium, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Loader2, Navigation, Search, X } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  city: string;
  icon: React.ComponentType<any>;
}

const getWeatherDetails = (code: number): { condition: string; icon: React.ComponentType<any> } => {
  if (code === 0) return { condition: 'Clear Sky', icon: SunMedium };
  if ([1, 2, 3].includes(code)) return { condition: 'Partly Cloudy', icon: Cloud };
  if ([45, 48].includes(code)) return { condition: 'Foggy', icon: Cloud };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Drizzle', icon: CloudDrizzle };
  if ([61, 63, 65, 66, 67].includes(code)) return { condition: 'Rainy', icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Snowy', icon: CloudSnow };
  if ([80, 81, 82].includes(code)) return { condition: 'Showers', icon: CloudRain };
  if ([95, 96, 99].includes(code)) return { condition: 'Thunderstorm', icon: CloudLightning };
  return { condition: 'Clear Sky', icon: SunMedium };
};

export const WeatherWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [weather, setWeatherData] = useState<WeatherData | null>(null);

  // Search states
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const loadWeather = async (customCoords?: { lat: number; lon: number; city: string }) => {
    try {
      setLoading(true);
      setError(false);
      let lat = 28.6139; // Default Delhi
      let lon = 77.2090;
      let city = 'New Delhi, India';

      if (customCoords) {
        lat = customCoords.lat;
        lon = customCoords.lon;
        city = customCoords.city;
      } else {
        // Geolocation logic
        const getGeoLocation = (): Promise<{ lat: number; lon: number }> => {
          return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Geolocation not supported'));
            } else {
              navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                (err) => reject(err),
                { timeout: 8000, enableHighAccuracy: true }
              );
            }
          });
        };

        try {
          const coords = await getGeoLocation();
          lat = coords.lat;
          lon = coords.lon;

          // Nominatim with email to prevent rate limits
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&email=panchalvedant331@gmail.com`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const addr = geoData.address;
            const place = addr.city || addr.town || addr.suburb || addr.village || addr.state || 'My Location';
            const country = addr.country || '';
            city = country ? `${place}, ${country}` : place;
          } else {
            city = 'Current Location';
          }
        } catch (geoError) {
          console.warn('Geolocation failed, falling back to IP lookup API:', geoError);
          // Geolocation failed or denied. Fallback to free IP lookup API to estimate location
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.latitude && ipData.longitude) {
                lat = ipData.latitude;
                lon = ipData.longitude;
                city = `${ipData.city || 'Delhi'}, ${ipData.country_name || 'India'}`;
              }
            }
          } catch (ipError) {
            console.warn('IP location estimation failed, using default coordinates.', ipError);
          }
        }
      }

      // Fetch live weather from free open-meteo API
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
      const res = await fetch(weatherUrl);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      const data = await res.json();

      const current = data.current;
      const details = getWeatherDetails(current.weather_code);

      setWeatherData({
        temp: Math.round(current.temperature_2m),
        condition: details.condition,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        city: city,
        icon: details.icon
      });
    } catch (err) {
      console.error('Error fetching live weather:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError('');

      // Search city coordinates via Open-Meteo Geocoding API (free, no-key)
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=1&language=en&format=json`;
      const res = await fetch(geoUrl);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const cityName = result.name;
        const regionName = result.admin1 || '';
        const countryName = result.country || '';
        const fullCity = [cityName, regionName, countryName].filter(Boolean).slice(0, 2).join(', ');

        setIsSearching(false);
        setSearchQuery('');
        await loadWeather({
          lat: result.latitude,
          lon: result.longitude,
          city: fullCity
        });
      } else {
        setSearchError('City not found. Try another city.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Search failed. Check your connection.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDetectLocation = () => {
    setIsSearching(false);
    loadWeather();
  };

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  if (loading && !weather) {
    return (
      <article className="fly-card fly-utility-card fly-weather-card flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-flyora-teal" size={24} />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Loading Live Weather...</span>
        </div>
      </article>
    );
  }

  const WeatherIcon = weather ? weather.icon : SunMedium;
  const currentCity = weather ? weather.city : 'New Delhi, India';
  const currentTemp = weather ? weather.temp : 32;
  const currentCondition = weather ? weather.condition : 'Sunny';
  const currentHumidity = weather ? weather.humidity : 42;
  const currentWind = weather ? weather.windSpeed : 12;

  return (
    <article className="fly-card fly-utility-card fly-weather-card relative overflow-visible">
      {/* Widget Header */}
      <div className="fly-card-title flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          Live Weather
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDetectLocation}
            title="Detect My Location"
            className="p-1 rounded-lg text-slate-400 hover:text-flyora-teal hover:bg-slate-50 transition"
          >
            <Navigation size={13} className={loading ? 'animate-pulse text-flyora-teal' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setIsSearching(!isSearching)}
            title="Search City"
            className="p-1 rounded-lg text-slate-400 hover:text-flyora-teal hover:bg-slate-50 transition"
          >
            {isSearching ? <X size={13} /> : <Search size={13} />}
          </button>
        </div>
      </div>

      {/* Geocoding Search Input Drawer */}
      {isSearching ? (
        <form onSubmit={handleSearchSubmit} className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 animate-fadeIn">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type city (e.g. Himmatnagar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dash-input text-xs flex-1 h-8 bg-white border border-slate-200"
              disabled={searchLoading}
            />
            <button
              type="submit"
              className="px-3 bg-flyora-teal hover:bg-teal-600 text-white text-xs font-black rounded-lg transition flex items-center justify-center min-w-[50px]"
              disabled={searchLoading}
            >
              {searchLoading ? <Loader2 size={12} className="animate-spin" /> : 'Find'}
            </button>
          </div>
          {searchError && (
            <div className="text-[10px] text-rose-500 font-bold mt-1.5 px-1">{searchError}</div>
          )}
        </form>
      ) : (
        /* Weather Details Display */
        <>
          <div className="fly-weather-location truncate mt-2 pr-4" title={currentCity}>
            {currentCity}
          </div>
          <div className="fly-weather-main">
            <div>
              <div className="fly-weather-temp">{currentTemp}°C</div>
              <div className="fly-weather-copy">{currentCondition}</div>
            </div>
            <WeatherIcon size={42} strokeWidth={1.8} className="fly-weather-icon" />
          </div>
          <div className="fly-weather-meta">
            <div>
              <span>Humidity</span>
              <strong>{currentHumidity}%</strong>
            </div>
            <div>
              <span>Wind</span>
              <strong>{currentWind} km/h</strong>
            </div>
          </div>
        </>
      )}
    </article>
  );
};
