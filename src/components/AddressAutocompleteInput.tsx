import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export interface AddressPrediction {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

interface AddressAutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (address: string) => void;
  onSelect?: (prediction: AddressPrediction) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({
  id,
  value,
  onChange,
  onSelect,
  placeholder = 'Start typing address in Edmonton & area...',
  required = false,
  className = '',
  autoFocus = false,
}) => {
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  // Fetch address predictions as user types
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.predictions)) {
            setPredictions(data.predictions);
            setIsOpen(data.predictions.length > 0);
          }
        }
      } catch (err) {
        console.warn('Address autocomplete error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPrediction = (prediction: AddressPrediction) => {
    onChange(prediction.description);
    setPredictions([]);
    setIsOpen(false);
    if (onSelect) {
      onSelect(prediction);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-3 pointer-events-none" />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
          required={required}
          autoFocus={autoFocus}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium ${className}`}
        />
        {isLoading && (
          <div className="absolute right-3 top-3 pointer-events-none">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && predictions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 text-xs animate-fadeIn"
        >
          {predictions.map((p, idx) => (
            <li
              key={p.placeId || idx}
              role="option"
              aria-selected="false"
              onClick={() => handleSelectPrediction(p)}
              className="p-2.5 hover:bg-blue-50/80 cursor-pointer flex items-start gap-2.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 leading-snug truncate">
                  {p.mainText}
                </div>
                {p.secondaryText && (
                  <div className="text-[11px] text-slate-500 truncate">
                    {p.secondaryText}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
