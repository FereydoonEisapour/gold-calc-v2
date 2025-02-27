import React, { useState } from 'react';
import { ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { formatPersianNumber, formatPersianCurrency } from '../utils/formatters';
import { convertCaratToWeight } from '../utils/api';

interface CaratCalculatorProps {
  onBack: () => void;
  goldPrices: {
    gold24k: number | null;
    gold18k: number | null;
    usd: number | null;
  };
}

const CaratCalculator: React.FC<CaratCalculatorProps> = ({ onBack, goldPrices }) => {
  const [weight, setWeight] = useState<number>(1);
  const [carat, setCarat] = useState<number>(750);
  const [result, setResult] = useState<{
    weight24k: number;
    weight18k: number;
    value24k: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setWeight(0);
    } else if (value > 10000) {
      setWeight(10000);
      setError('حداکثر وزن مجاز ۱۰۰۰۰ گرم است');
    } else {
      setWeight(value);
      setError(null);
    }
  };

  const handleCaratChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      setCarat(0);
    } else if (value > 1000) {
      setCarat(1000);
      setError('حداکثر عیار مجاز ۱۰۰۰ است');
    } else {
      setCarat(value);
      setError(null);
    }
  };

  const handleCalculate = () => {
    if (!isValidInput(weight, carat)) {
      setError('ورودی‌ها نامعتبر هستند!');
      setResult(null);
      return;
    }

    const { weight24k, weight18k } = convertCaratToWeight(weight, carat);
    const value24k = goldPrices.gold24k ? weight24k * goldPrices.gold24k : 0;

    setResult({
      weight24k,
      weight18k,
      value24k
    });
    setError(null);
  };

  const isValidInput = (weight: number, carat: number) => {
    return !isNaN(weight) && !isNaN(carat) && weight > 0 && carat > 0 && carat <= 1000;
  };

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="text-amber-700 hover:text-amber-900 p-1 rounded-full ml-3"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gold-dark">تبدیل عیار طلا</h2>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          با استفاده از این ابزار می‌توانید وزن طلا را بر اساس عیار آن محاسبه کنید.
        </p>
        
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-4 flex items-start">
            <AlertTriangle className="text-red-500 ml-3 mt-1 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              وزن (گرم)
              <span className="text-xs text-gray-500 mr-2 group relative inline-block">
                <Info className="w-4 h-4 inline-block" />
                <span className="tooltip">
                  وزن طلا را به گرم وارد کنید. محدوده مجاز: ۰.۱ تا ۱۰۰۰۰ گرم
                </span>
              </span>
            </label>
            <input
              type="number"
              value={weight || ''}
              onChange={handleWeightChange}
              min="0.1"
              max="10000"
              step="0.1"
              className="input-field"
              placeholder="وزن طلا به گرم"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              عیار
              <span className="text-xs text-gray-500 mr-2 group relative inline-block">
                <Info className="w-4 h-4 inline-block" />
                <span className="tooltip">
                  عیار طلا را وارد کنید. مثال: ۷۵۰ برای طلای ۱۸ عیار، ۹۹۹ برای طلای ۲۴ عیار
                </span>
              </span>
            </label>
            <input
              type="number"
              value={carat || ''}
              onChange={handleCaratChange}
              min="1"
              max="1000"
              step="1"
              className="input-field"
              placeholder="عیار طلا (مثال: ۷۵۰)"
            />
          </div>
        </div>
        
        <button 
          onClick={handleCalculate}
          className="btn-primary w-full"
        >
          محاسبه
        </button>
      </div>
      
      {result && (
        <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
          <h3 className="text-lg font-bold text-amber-800 mb-4">نتیجه تبدیل</h3>
          
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-amber-100">
                <th className="text-right p-2 border border-amber-200">عنوان</th>
                <th className="text-right p-2 border border-amber-200">مقدار</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-amber-200">نسبت به وزن طلای ۲۴ عیار</td>
                <td className="p-2 border border-amber-200">{formatPersianNumber(result.weight24k)} گرم</td>
              </tr>
              <tr>
                <td className="p-2 border border-amber-200">نسبت به وزن طلای ۱۸ عیار</td>
                <td className="p-2 border border-amber-200">{formatPersianNumber(result.weight18k)} گرم</td>
              </tr>
              <tr>
                <td className="p-2 border border-amber-200">ارزش تقریبی طلا</td>
                <td className="p-2 border border-amber-200">
                  {goldPrices.gold24k 
                    ? formatPersianCurrency(result.value24k) 
                    : 'قیمت طلا در دسترس نیست'}
                </td>
              </tr>
            </tbody>
          </table>
          
          <p className="text-sm text-gray-600">
            توجه: این محاسبات تقریبی هستند و ممکن است با مقادیر واقعی تفاوت داشته باشند.
          </p>
        </div>
      )}
    </div>
  );
};

export default CaratCalculator;