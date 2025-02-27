import React, { useState, useEffect } from 'react';
import { Trash2, ArrowRight } from 'lucide-react';
import { getSavedCalculations, deleteCalculation } from '../utils/storage';
import { SavedCalculation } from '../types';
import { formatPersianNumber, formatPersianCurrency, formatPersianDate } from '../utils/formatters';
import { toast } from 'react-toastify';

interface SavedCalculationsProps {
  onBack: () => void;
}

const SavedCalculations: React.FC<SavedCalculationsProps> = ({ onBack }) => {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);

  useEffect(() => {
    loadSavedCalculations();
  }, []);

  const loadSavedCalculations = () => {
    const saved = getSavedCalculations();
    setCalculations(saved.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleDelete = (id: string) => {
    const success = deleteCalculation(id);
    if (success) {
      setCalculations(calculations.filter(calc => calc.id !== id));
      toast.success('محاسبه با موفقیت حذف شد');
    } else {
      toast.error('خطا در حذف محاسبه');
    }
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
        <h2 className="text-xl font-bold text-gold-dark">محاسبات ذخیره شده</h2>
      </div>

      {calculations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>هیچ محاسبه‌ای ذخیره نشده است</p>
        </div>
      ) : (
        <div className="space-y-4">
          {calculations.map(calc => (
            <div 
              key={calc.id} 
              className="border border-amber-200 rounded-lg p-4 hover:bg-amber-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    {formatPersianDate(calc.timestamp)}
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                      <span className="text-gray-600 ml-1">وزن:</span>
                      <span className="font-medium">{formatPersianNumber(calc.weight)} گرم</span>
                    </div>
                    <div>
                      <span className="text-gray-600 ml-1">خلوص:</span>
                      <span className="font-medium">{formatPersianNumber(calc.purity)}٪</span>
                    </div>
                    <div>
                      <span className="text-gray-600 ml-1">قیمت هر گرم:</span>
                      <span className="font-medium">{formatPersianCurrency(calc.price)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 ml-1">ارزش کل:</span>
                      <span className="font-medium text-amber-700">{formatPersianCurrency(calc.totalValue)}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(calc.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCalculations;