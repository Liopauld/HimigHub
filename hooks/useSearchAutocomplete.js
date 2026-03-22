import { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useSearchAutocomplete = () => {
  const { products } = useSelector((state) => state.product);
  const [input, setInput] = useState('');

  const suggestions = useMemo(() => {
    if (!input.trim() || !Array.isArray(products)) return [];

    const lowerInput = input.toLowerCase();
    const uniqueSuggestions = new Set();

    products.forEach((product) => {
      const name = product.name || '';
      if (name.toLowerCase().includes(lowerInput)) {
        uniqueSuggestions.add(name);
      }
      
      const category = product.category || '';
      if (category.toLowerCase().includes(lowerInput)) {
        uniqueSuggestions.add(category);
      }
    });

    return Array.from(uniqueSuggestions)
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(lowerInput);
        const bStartsWith = b.toLowerCase().startsWith(lowerInput);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 8);
  }, [input, products]);

  const handleSelectSuggestion = useCallback((suggestion) => {
    setInput(suggestion);
  }, []);

  const clearInput = useCallback(() => {
    setInput('');
  }, []);

  return {
    input,
    setInput,
    suggestions,
    handleSelectSuggestion,
    clearInput,
  };
};
