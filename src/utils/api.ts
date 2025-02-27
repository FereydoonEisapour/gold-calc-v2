import axios from 'axios';
import { ApiResponse, GoldPrice, HistoricalPrice } from '../types';

// Real API endpoint for gold prices
const GOLD_API_URL = 'https://brsapi.ir/FreeTsetmcBourseApi/Api_Free_Gold_Currency.json';

 
// Fetch current gold price from real API
export const fetchCurrentGoldPrice = async (): Promise<GoldPrice> => {
  try {
    const response = await axios.get(GOLD_API_URL);
    
    if (!response.data) {
      throw new Error('No data received from API');
    }
    
    // Extract gold prices from API response
    const gram24kGold = response.data.gold.find((item: any) => item.name === "گرم طلای 24 عیار");
    const gram18kGold = response.data.gold.find((item: any) => item.name === "گرم طلای 18 عیار");
    const usdCurrency = response.data.currency.find((item: any) => item.name === "دلار");
    
    if (!gram24kGold) {
      throw new Error('Could not find 24k gold price in API response');
    }
    
    
    
    return {
      price: gram24kGold.price,
      currency: 'IRT',
      timestamp: Date.now(),
      prices: {
        gold24k: gram24kGold.price ,
        gold18k: gram18kGold ? gram18kGold.price  : null,
        usd: usdCurrency ? usdCurrency.price : null
      }
    };
  } catch (error) {
    console.error('Error fetching gold price from API:', error);
    
    // Fallback to mock data if API fails
    return fallbackToMockData();
  }
};

// Fallback to mock data if API fails
const fallbackToMockData = (): GoldPrice => {
  const mockPrice24k = 28500000;
  const mockPrice18k = mockPrice24k * 0.75;
  const mockUsdPrice = 68000;
  
  return {
    price: mockPrice24k,
    currency: 'IRT',
    timestamp: Date.now(),
    prices: {
      gold24k: mockPrice24k,
      gold18k: mockPrice18k,
      usd: mockUsdPrice
    }
  };
};

// Generate historical prices based on current price
export const fetchHistoricalPrices = async (days: number = 7): Promise<HistoricalPrice[]> => {
  try {
    // Get current price first
    const currentPrice = await fetchCurrentGoldPrice();
    const basePrice = currentPrice.price;
    
    // Generate historical data
    const today = new Date();
    const historicalPrices: HistoricalPrice[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create realistic price fluctuations (±5%)
      const fluctuation = 1 + ((Math.random() * 0.1) - 0.05);
      const historicalPrice = Math.round(basePrice * fluctuation);
      
      historicalPrices.push({
        date: date.toISOString().split('T')[0],
        price: historicalPrice
      });
    }
    
    return historicalPrices;
  } catch (error) {
    console.error('Error generating historical prices:', error);
    
    // Fallback to mock historical data
    return generateMockHistoricalPrices(days);
  }
};

// Generate mock historical prices if API fails
const generateMockHistoricalPrices = (days: number): HistoricalPrice[] => {
  const MOCK_GOLD_PRICE = 28500000;
  const today = new Date();
  const historicalPrices: HistoricalPrice[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const basePrice = MOCK_GOLD_PRICE * (1 + (Math.random() * 0.1 - 0.05));
    
    historicalPrices.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(basePrice)
    });
  }
  
  return historicalPrices;
};

// Convert IRR to USD
export const convertToUSD = (amountInIRR: number,usd_price:number ): number => {
  return amountInIRR / usd_price;
};

// Calculate gold value based on weight, purity and current price
export const calculateGoldValue = (
  weight: number, 
  purity: number, 
  goldPrice: number
): number => {
  if (!weight || !goldPrice) return 0;
  return weight * goldPrice * (purity / 100);
};

// Convert carat to weight equivalent
export const convertCaratToWeight = (
  weight: number,
  carat: number
): { weight24k: number, weight18k: number } => {
  if (!weight || !carat) {
    return { weight24k: 0, weight18k: 0 };
  }
  
  const weight24k = (carat * weight) / 1000;
  const weight18k = (carat * weight) / 750;
  
  return {
    weight24k: parseFloat(weight24k.toFixed(3)),
    weight18k: parseFloat(weight18k.toFixed(3))
  };
};

// Handle API errors
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return `خطا در دریافت اطلاعات: ${error.response.status} - ${error.response.data.message || 'خطای نامشخص'}`;
    } else if (error.request) {
      return 'خطا در برقراری ارتباط با سرور. لطفا اتصال اینترنت خود را بررسی کنید.';
    }
  }
  return 'خطای نامشخص در دریافت اطلاعات قیمت طلا.';
};