export interface GoldPrice {
  price: number;
  currency: string;
  timestamp: number;
  prices?: {
    gold24k: number;
    gold18k: number | null;
    usd: number | null;
  };
}

export interface HistoricalPrice {
  date: string;
  price: number;
}

export interface SavedCalculation {
  id: string;
  weight: number;
  purity: number;
  price: number;
  totalValue: number;
  timestamp: number;
}

export interface ApiResponse {
  success: boolean;
  data: {
    price: number;
    currency: string;
    timestamp: number;
    historical?: HistoricalPrice[];
  };
  error?: string;
}

export interface CaratConversion {
  weight: number;
  carat: number;
  weight24k: number;
  weight18k: number;
  value24k: number;
}