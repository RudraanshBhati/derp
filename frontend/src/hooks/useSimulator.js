import { useState, useEffect, useCallback } from 'react';
import { calculateImpact } from '../components/simulator/simulatorEngine';

// Debounce helper
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export function useSimulator() {
  const [params, setParams] = useState({
    rainfall: 0,      // % change (-50 to +50)
    temperature: 0,   // deg C change (0 to +5)
    extraction: 0,    // % change (-50 to +50)
    population: 0     // % growth (0 to +20)
  });

  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const debouncedParams = useDebounce(params, 300);

  useEffect(() => {
    // Simulate calculation delay for realism
    const timer = setTimeout(() => {
      setIsCalculating(true);
      const data = calculateImpact(debouncedParams);
      setResults(data);
      setIsCalculating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [debouncedParams]);

  const updateParam = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyPreset = (preset) => {
    switch (preset) {
      case 'drought':
        setParams({ rainfall: -30, temperature: 2.5, extraction: 10, population: 0 });
        break;
      case 'flood':
        setParams({ rainfall: 40, temperature: -1, extraction: -10, population: 0 });
        break;
      case 'policy':
        setParams({ rainfall: 0, temperature: 0, extraction: -25, population: 5 });
        break;
      case 'reset':
        setParams({ rainfall: 0, temperature: 0, extraction: 0, population: 0 });
        break;
      default:
        break;
    }
  };

  return {
    params,
    results,
    isCalculating,
    updateParam,
    applyPreset
  };
}
