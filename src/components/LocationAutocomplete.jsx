import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const LocationAutocomplete = ({ value, onChange, placeholder, label, required }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Using Nominatim API (OpenStreetMap) for geocoding
      // Free and open-source, no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}` +
        `&format=json` +
        `&addressdetails=1` +
        `&limit=5` +
        `&countrycodes=in`, // Restrict to India
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GreenCommute-Carpooling-App' // Required by Nominatim
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Debounce API calls (wait 500ms after user stops typing)
    debounceTimeout.current = setTimeout(() => {
      searchLocations(newValue);
    }, 500);

    // Notify parent with just the text
    if (newValue !== value) {
      onChange({ address: newValue, lat: null, lng: null });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const locationData = {
      address: suggestion.display_name,
      name: suggestion.name || suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      placeId: suggestion.place_id
    };

    setInputValue(locationData.address);
    setShowSuggestions(false);
    setSuggestions([]);
    onChange(locationData);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        autoComplete="off"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-[42px] transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1">📍</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {suggestion.name || suggestion.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {suggestion.display_name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && inputValue.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
          No locations found. Try a different search term.
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        {inputValue.length < 3
          ? 'Type at least 3 characters to search locations'
          : 'Select from suggestions or continue typing'
        }
      </p>
    </div>
  );
};

LocationAutocomplete.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool
};

LocationAutocomplete.defaultProps = {
  value: '',
  placeholder: 'Enter location',
  label: '',
  required: false
};

export default LocationAutocomplete;
