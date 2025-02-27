import { SavedCalculation } from '../types';

const STORAGE_KEY = 'tala_abshodeh_saved_calculations';

// Save calculation to local storage
export const saveCalculation = (calculation: Omit<SavedCalculation, 'id'>): SavedCalculation => {
  const savedCalculations = getSavedCalculations();
  
  const newCalculation: SavedCalculation = {
    ...calculation,
    id: Date.now().toString(),
  };
  
  savedCalculations.push(newCalculation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCalculations));
  
  return newCalculation;
};

// Get all saved calculations from local storage
export const getSavedCalculations = (): SavedCalculation[] => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) return [];
  
  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.error('Error parsing saved calculations:', error);
    return [];
  }
};

// Delete a saved calculation
export const deleteCalculation = (id: string): boolean => {
  const savedCalculations = getSavedCalculations();
  const updatedCalculations = savedCalculations.filter(calc => calc.id !== id);
  
  if (updatedCalculations.length === savedCalculations.length) {
    return false; // Nothing was deleted
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCalculations));
  return true;
};

// Save last known gold price for offline use
export const saveLastKnownPrice = (price: number, timestamp: number): void => {
  localStorage.setItem('last_known_gold_price', JSON.stringify({ price, timestamp }));
};

// Get last known gold price
export const getLastKnownPrice = (): { price: number, timestamp: number } | null => {
  const data = localStorage.getItem('last_known_gold_price');
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing last known price:', error);
    return null;
  }
};